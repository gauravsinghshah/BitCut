import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ── Security Headers (helmet) ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// ── CORS — restrict in production ──────────────────────────────
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL || `http://localhost:${PORT}`]
  : ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200,
}));

// ── Body Parser with size limit ────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Rate Limiting ──────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 50,                      // 50 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1 minute
  max: 120,                     // 120 redirects per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

// ── Serve static frontend in production ────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// ── Click dedup cache — prevent double-counting ────────────────
// Browsers can prefetch links or send duplicate requests.
// This ensures each IP only counts once per short code per 5 seconds.
const recentClicks = new Map();
const CLICK_DEDUP_MS = 5000;

// Clean up stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentClicks) {
    if (now - timestamp > CLICK_DEDUP_MS) {
      recentClicks.delete(key);
    }
  }
}, 60000);

// ── URL validation helper ──────────────────────────────────────
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
const MAX_URL_LENGTH = 2048;

function validateUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  if (urlString.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL must be under ${MAX_URL_LENGTH} characters` };
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Block dangerous protocols
  const protocol = parsed.protocol.toLowerCase();
  if (BLOCKED_PROTOCOLS.includes(protocol)) {
    return { valid: false, error: 'This URL protocol is not allowed' };
  }

  // Only allow http and https
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
  }

  // Block localhost / internal IPs to prevent SSRF-like abuse
  const hostname = parsed.hostname.toLowerCase();
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blockedHosts.includes(hostname) || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
    return { valid: false, error: 'Internal/private URLs cannot be shortened' };
  }

  return { valid: true, url: parsed.href };
}

// ── Short code generation with collision retry ─────────────────
function generateUniqueCode(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    const code = nanoid(6);
    const existing = db.prepare('SELECT id FROM links WHERE short_code = ?').get(code);
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique short code');
}

// ── Short code validation ──────────────────────────────────────
const SHORT_CODE_REGEX = /^[A-Za-z0-9_-]{1,10}$/;

// ── POST /api/shorten ──────────────────────────────────────────
app.post('/api/shorten', apiLimiter, (req, res) => {
  const { url } = req.body;

  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const shortCode = generateUniqueCode();

    const stmt = db.prepare(
      'INSERT INTO links (original_url, short_code) VALUES (?, ?)'
    );
    stmt.run(validation.url, shortCode);

    res.json({
      success: true,
      shortCode,
      originalUrl: validation.url,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    });
  } catch (err) {
    console.error('Shorten Error:', err.message);
    res.status(500).json({ error: 'Failed to shorten URL. Please try again.' });
  }
});

// ── GET /api/stats ─────────────────────────────────────────────
app.get('/api/stats', apiLimiter, (_req, res) => {
  try {
    // Increment site visits count
    db.prepare('UPDATE global_stats SET site_visits = site_visits + 1 WHERE id = 1').run();
    const statsRow = db.prepare('SELECT site_visits FROM global_stats WHERE id = 1').get();

    const totalLinks = db.prepare('SELECT COUNT(*) as count FROM links').get();

    res.json({
      siteVisits: statsRow.site_visits || 0,
      totalLinks: totalLinks.count || 0,
    });
  } catch (err) {
    console.error('Stats Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /:shortCode (Redirect) ────────────────────────────────
app.get('/:shortCode', redirectLimiter, (req, res) => {
  const { shortCode } = req.params;

  // Skip file requests
  if (shortCode.includes('.') || shortCode === 'favicon.ico') {
    return res.status(404).end();
  }

  // Validate short code format to prevent injection
  if (!SHORT_CODE_REGEX.test(shortCode)) {
    return res.status(400).json({ error: 'Invalid short code format' });
  }

  try {
    const link = db
      .prepare('SELECT original_url, short_code FROM links WHERE short_code = ?')
      .get(shortCode);

    if (!link) {
      // SPA fallback in production
      const indexPath = path.join(distPath, 'index.html');
      return res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(404).json({ error: 'Short link not found' });
        }
      });
    }

    // Increment click counter — deduplicate rapid/duplicate requests
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const dedupKey = `${clientIp}:${shortCode}`;
    const now = Date.now();
    const lastClick = recentClicks.get(dedupKey);

    if (!lastClick || (now - lastClick) > CLICK_DEDUP_MS) {
      recentClicks.set(dedupKey, now);
      try {
        db.prepare('UPDATE links SET clicks = clicks + 1 WHERE short_code = ?').run(shortCode);
      } catch {
        // Non-critical — don't block redirect if counter fails
      }
    }

    // Use 302 instead of 301 — 301 is cached forever by browsers,
    // making click tracking useless after first visit
    return res.redirect(302, link.original_url);
  } catch (err) {
    console.error('Redirect Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Global error handler — don't leak stack traces ─────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`⚡ BitCut server running on http://localhost:${PORT} [${isProduction ? 'production' : 'development'}]`);
});
