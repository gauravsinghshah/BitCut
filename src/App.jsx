import { useState, useCallback, useEffect } from 'react'
import { Link, ArrowRight, Copy, Check, Zap, BarChart3, ExternalLink, AlertCircle, Sun, Moon, Scissors, Users } from 'lucide-react'

/* ── GitHub SVG Icon ─────────────────────────────────────────── */
function GithubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
import './index.css'

/* ── Theme Hook ──────────────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitcut-theme')
      if (saved) return saved
    }
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-transitioning')
    root.setAttribute('data-theme', theme)
    localStorage.setItem('bitcut-theme', theme)
    const timer = setTimeout(() => root.classList.remove('theme-transitioning'), 500)
    return () => clearTimeout(timer)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return [theme, toggle]
}

/* ── Navbar Component ────────────────────────────────────────── */
function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar" id="navbar">
      {/* Logo */}
      <a href="/" className="navbar-logo">
        <div className="logo-icon">
          <Scissors size={17} />
        </div>
        <span>BitCut</span>
      </a>

      {/* Right side */}
      <div className="navbar-links">
        <a
          href="https://github.com/gauravsinghshah"
          target="_blank"
          rel="noopener noreferrer"
          id="github-link"
          className="github-btn"
        >
          <GithubIcon size={16} />
          <span>Gaurav Singh</span>
        </a>
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </nav>
  )
}

/* ── Ticker Component ────────────────────────────────────────── */
function Ticker() {
  const items = [
    'Made by Gaurav Singh',
    'Powered by React & Node',
    'Elevate your links',
    'Zero fluff • Pure utility',
    'Fast redirects',
    'SQLite powered',
    'Open & lightweight',
  ]

  const tickerContent = (
    <>
      {items.map((item, i) => (
        <span key={i}>
          <span className="dot"></span>
          {item}
        </span>
      ))}
    </>
  )

  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  )
}

/* ── Result Card Component ───────────────────────────────────── */
function ResultCard({ result, backendUrl }) {
  const [copied, setCopied] = useState(false)

  const shortUrl = `${backendUrl}/${result.shortCode}`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shortUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [shortUrl])

  return (
    <div className="result-card"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginTop: '32px',
        maxWidth: '640px',
        width: '100%',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div
          className="pulse-dot"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22d3ee',
          }}
        />
        <span style={{
          fontFamily: "'Space Grotesk', monospace",
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--cyan-500)',
        }}>
          Link Created
        </span>
      </div>

      {/* Short URL display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: 'var(--result-bg)',
        borderRadius: '10px',
        border: '1px solid var(--result-border)',
        marginBottom: '16px',
      }}>
        <Link size={18} style={{ color: 'var(--cyan-600)', flexShrink: 0 }} />
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Space Grotesk', monospace",
            fontWeight: 600,
            fontSize: '17px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shortUrl}
        </a>
        <button
          id="copy-button"
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '13px',
            fontWeight: 600,
            color: copied ? '#16a34a' : 'var(--cyan-600)',
            background: copied ? 'rgba(34, 197, 94, 0.12)' : 'rgba(6, 182, 212, 0.08)',
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Original URL */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>
        <ExternalLink size={13} />
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {result.originalUrl}
        </span>
      </div>
    </div>
  )
}

/* ── Main App Component ──────────────────────────────────────── */
function App() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ visitors: 0, links: 0 })
  const [theme, toggleTheme] = useTheme()

  // In dev, Vite runs on 5173 and Express on 3001 — redirects only work on Express
  // In production, both are served from the same origin
  const isDev = typeof window !== 'undefined' && window.location.port === '5173'
  const BACKEND_URL = isDev ? 'http://localhost:3001' : (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats({ visitors: data.siteVisits || 0, links: data.totalLinks || 0 })
      })
      .catch(err => console.error('Failed to load stats:', err))
  }, [])

  const handleShorten = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    let finalUrl = url.trim()

    // Client-side length check
    if (finalUrl.length > 2048) {
      setError('URL is too long (max 2048 characters)')
      return
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    // Block dangerous protocols on client side too
    try {
      const parsed = new URL(finalUrl)
      const blocked = ['javascript:', 'data:', 'vbscript:', 'file:']
      if (blocked.includes(parsed.protocol.toLowerCase())) {
        setError('This URL type is not allowed')
        return
      }
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data)
      setUrl('')
    } catch (err) {
      // Sanitize error message — only show safe strings
      const safeMessage = typeof err.message === 'string'
        ? err.message.replace(/<[^>]*>/g, '').slice(0, 200)
        : 'Failed to shorten URL'
      setError(safeMessage)
    } finally {
      setLoading(false)
    }
  }, [url])

  return (
    <>
      {/* Navbar */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Blueprint Grid Background */}
      <div className="blueprint-grid" />

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '100px 20px 80px',
      }}>
        {/* Top Badge */}
        <div
          className="float-subtle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'var(--badge-bg)',
            border: '1px solid var(--badge-border)',
            marginBottom: '28px',
          }}
        >
          <Zap size={14} style={{ color: 'var(--cyan-600)' }} />
          <span style={{
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--cyan-600)',
          }}>
            Fast • Free • Open
          </span>
        </div>

        {/* Hero Title — UPPERCASE like Vibecon */}
        <h1
          className="hero-gradient"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            marginBottom: '20px',
            maxWidth: '800px',
            textTransform: 'uppercase',
          }}
        >
          SHORTEN
          <br />
          ANY URL
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '480px',
          lineHeight: 1.6,
          marginBottom: '48px',
          fontWeight: 400,
        }}>
          Paste your long URL and get a clean, trackable short link in milliseconds.
        </p>

        {/* URL Input Form */}
        <form
          id="shorten-form"
          onSubmit={handleShorten}
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '640px',
            position: 'relative',
          }}
        >
          <div style={{
            display: 'flex',
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: '14px',
            border: error ? '2px solid var(--error-text)' : '2px solid var(--border-input)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-input)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '18px',
              color: 'var(--text-muted)',
            }}>
              <Link size={20} />
            </div>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="Paste your long URL here..."
              className="url-input"
              autoComplete="off"
              maxLength={2048}
              style={{
                flex: 1,
                padding: '18px 16px',
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                fontFamily: "'Inter', sans-serif",
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              id="shorten-button"
              type="submit"
              disabled={loading}
              className="shorten-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                margin: '6px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: 'white',
                fontSize: '15px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  Shorten
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div
            className="shake"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error-text)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && <ResultCard result={result} backendUrl={BACKEND_URL} />}

        {/* Global Live Stats */}
        <div style={{
          display: 'flex',
          gap: '32px',
          marginTop: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'var(--bg-card)',
          padding: '16px 32px',
          borderRadius: '999px',
          border: '1px solid var(--border-card)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            <Users size={18} style={{ color: 'var(--cyan-500)' }} />
            <span>{stats.visitors.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Visitors</span></span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            <Link size={18} style={{ color: 'var(--blue-500)' }} />
            <span>{stats.links.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Links</span></span>
          </div>
        </div>

        {/* Developer credit */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontFamily: "'Inter', sans-serif",
        }}>
          <span>Built by</span>
          <a
            href="https://github.com/gauravsinghshah"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--cyan-600)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GithubIcon size={13} />
            Gaurav Singh
          </a>
        </div>
      </main>

      {/* Bottom Ticker */}
      <Ticker />
    </>
  )
}

export default App
