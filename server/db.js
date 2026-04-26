import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'urls.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Security: prevent large memory usage from crafted queries
db.pragma('hard_heap_limit = 67108864'); // 64MB max

// Create the links table
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create stats table for visitors count
db.exec(`
  CREATE TABLE IF NOT EXISTS global_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_visits INTEGER DEFAULT 0
  )
`);
db.exec(`INSERT OR IGNORE INTO global_stats (id, site_visits) VALUES (1, 0)`);

// Create index for fast lookups on short_code (if not exists)
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code)
`);

// Graceful shutdown — close DB connection
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

export default db;
