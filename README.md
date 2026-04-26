<div align="center">

# ✂️ BitCut — URL Shortener

### Fast. Free. Open. Shorten any URL in milliseconds.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

<br/>

**BitCut** is a modern, full-stack URL shortener built with React and Node.js. Paste any long URL, get a clean short link with click tracking — all powered by a lightweight SQLite database with zero external dependencies.

<br/>

<img src="https://img.shields.io/badge/⚡_Live_Demo-Coming_Soon-0891b2?style=for-the-badge" alt="Live Demo"/>

</div>

---

## 📸 Screenshots

| Dark Mode | Light Mode |
|:---------:|:----------:|
| ![Dark Mode](https://via.placeholder.com/480x300/0b0f1a/22d3ee?text=BitCut+Dark+Mode) | ![Light Mode](https://via.placeholder.com/480x300/F8FAFC/1e40af?text=BitCut+Light+Mode) |

> Replace these placeholders with actual screenshots of your running app.

---

## ✨ Key Features

- 🔗 **Instant URL Shortening** — Paste a long URL, get a 6-character short link in milliseconds
- 📊 **Click Tracking** — Every redirect increments a click counter automatically
- 🌗 **Dark / Light Theme** — Toggle between themes with smooth transitions, dark mode by default
- 📋 **One-Click Copy** — Copy short links to clipboard with visual feedback
- 🎨 **Vibecon Aesthetic** — Blueprint grid background, massive typography, cyan/blue gradients
- 📱 **Fully Responsive** — Works seamlessly on desktop, tablet, and mobile
- 🔒 **Security Hardened** — Rate limiting, input validation, helmet headers, XSS protection
- ⚡ **Zero Config Database** — SQLite with file-based storage, no external DB server needed
- 🚀 **Production Ready** — Single `npm start` command serves both frontend and backend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React)                      │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Navbar   │  │  Hero + Form  │  │   Result Card     │  │
│  │  (Theme)  │  │  (URL Input)  │  │   (Copy Button)   │  │
│  └──────────┘  └──────┬───────┘  └───────────────────┘  │
│                       │                                   │
│                  POST /api/shorten                        │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                    │
│                                                          │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ POST /api/     │  │ GET /:code  │  │  Security    │  │
│  │   shorten      │  │ (Redirect)  │  │  Middleware   │  │
│  │                │  │             │  │              │  │
│  │ • Validate URL │  │ • Lookup DB │  │ • Helmet     │  │
│  │ • Generate ID  │  │ • Track     │  │ • Rate Limit │  │
│  │ • Store in DB  │  │   clicks    │  │ • CORS       │  │
│  │ • Return code  │  │ • 302       │  │ • Validation │  │
│  └───────┬────────┘  └──────┬──────┘  └──────────────┘  │
│          │                  │                             │
│          └──────────┬───────┘                             │
│                     ▼                                     │
│          ┌──────────────────┐                             │
│          │   SQLite (urls.db) │                            │
│          │                    │                            │
│          │ • id (PK)          │                            │
│          │ • original_url     │                            │
│          │ • short_code (UQ)  │                            │
│          │ • clicks           │                            │
│          │ • created_at       │                            │
│          └──────────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 How It Works

### 1. User Submits a URL
The user pastes a long URL into the input field and clicks **"Shorten →"**. The frontend sends a `POST` request to `/api/shorten` with the URL in the request body.

### 2. Server Validates & Stores
The Express backend:
- **Validates** the URL format (must be `http://` or `https://`)
- **Blocks** dangerous protocols (`javascript:`, `data:`, `vbscript:`)
- **Blocks** internal/private IPs to prevent SSRF
- **Generates** a unique 6-character code using `nanoid`
- **Stores** the mapping in SQLite with collision retry logic

### 3. Short Link is Returned
The server responds with the short code. The frontend displays a beautiful result card with the short URL and a **one-click copy button**.

### 4. Redirect on Visit
When someone visits the short URL (`GET /:shortCode`):
- The server looks up the code in SQLite
- Increments the **click counter** by 1
- Performs a **302 redirect** to the original URL
- The user is seamlessly sent to the destination

---

## 🔒 Security Features

| Protection | Implementation |
|-----------|---------------|
| **XSS Prevention** | Helmet security headers, CSP in production |
| **Rate Limiting** | 50 API requests / 15 min, 120 redirects / min per IP |
| **Input Validation** | URL format check, protocol whitelist (HTTP/HTTPS only) |
| **Open Redirect Block** | Blocks `javascript:`, `data:`, `vbscript:`, `file:` protocols |
| **SSRF Protection** | Blocks localhost, 127.0.0.1, private IP ranges |
| **Body Size Limit** | Max 10KB request body to prevent payload attacks |
| **URL Length Limit** | Max 2048 characters (client + server enforced) |
| **Collision Handling** | nanoid retry up to 5 times on duplicate codes |
| **Error Sanitization** | Stack traces hidden, HTML stripped from error messages |
| **CORS Restriction** | Allowed origins whitelist in production |
| **Graceful Shutdown** | Database connection properly closed on exit |

---

## 📁 Project Structure

```
BitCut/
├── server/
│   ├── index.js          # Express API server (routes, middleware, security)
│   └── db.js             # SQLite database initialization & schema
│
├── src/
│   ├── App.jsx           # Main React app (Navbar, Hero, Form, Result Card, Ticker)
│   ├── index.css         # Global CSS (themes, grid, animations, marquee)
│   └── main.jsx          # React DOM entry point
│
├── public/
│   └── favicon.svg       # BitCut favicon
│
├── index.html            # HTML template with SEO meta tags
├── vite.config.js        # Vite + Tailwind CSS + API proxy config
├── package.json          # Dependencies & scripts
└── README.md             # You are here!
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gauravsinghshah/bitcut.git
cd bitcut

# 2. Install dependencies
npm install

# 3. Start the development server (frontend + backend)
npm run dev
```

This runs both servers concurrently:
- **Frontend** → `http://localhost:5173` (Vite dev server with HMR)
- **Backend** → `http://localhost:3001` (Express API + redirects)

### Production Build

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

In production, the Express server serves the built React app from the `dist/` folder. Everything runs on a single port.

---

## 🌐 Deployment

### Deploy on Render (Recommended — Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `NODE_ENV=production`
5. Deploy! Your URLs will be like `https://bitcut.onrender.com/abc123`

### Other Platforms

| Platform | Build Command | Start Command |
|----------|--------------|---------------|
| **Railway** | `npm install && npm run build` | `npm start` |
| **Fly.io** | `npm install && npm run build` | `npm start` |
| **DigitalOcean** | `npm install && npm run build` | `npm start` |

> **Note:** GitHub Pages and Vercel are **not compatible** with this project because they don't support persistent Node.js servers with file-based databases.

---

## 📡 API Reference

### Shorten a URL

```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url"
}
```

**Response:**

```json
{
  "success": true,
  "shortCode": "aB3xYz",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "https://yourdomain.com/aB3xYz"
}
```

### Redirect

```http
GET /:shortCode → 302 Redirect to original URL
```

### Stats

```http
GET /api/stats
```

```json
{
  "totalLinks": 42,
  "totalClicks": 1337
}
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:-----:|:----------:|:-------:|
| **Frontend** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Components & State |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Utility-first CSS |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white) | Dev Server & Bundler |
| **Icons** | ![Lucide](https://img.shields.io/badge/Lucide_React-F56565?style=flat-square) | SVG Icon Library |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime |
| **Framework** | ![Express](https://img.shields.io/badge/Express.js_5-000000?style=flat-square&logo=express&logoColor=white) | HTTP Server & Routing |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) | Persistent Storage |
| **DB Driver** | ![better-sqlite3](https://img.shields.io/badge/better--sqlite3-4A90D9?style=flat-square) | Sync SQLite Bindings |
| **ID Generator** | ![nanoid](https://img.shields.io/badge/nanoid-FF6600?style=flat-square) | Short Code Generation |
| **Security** | ![Helmet](https://img.shields.io/badge/Helmet-8B8B8B?style=flat-square) | HTTP Security Headers |
| **Rate Limit** | ![express-rate-limit](https://img.shields.io/badge/express--rate--limit-DC3545?style=flat-square) | API Rate Limiting |

</div>

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (Vite) + backend (Express) concurrently |
| `npm run dev:frontend` | Start only the Vite dev server |
| `npm run dev:backend` | Start only the Express server |
| `npm run build` | Build the React frontend for production |
| `npm start` | Run the production server (serves built frontend) |
| `npm run lint` | Run ESLint checks |

---

## 🗄️ Database Schema

```sql
CREATE TABLE links (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT    NOT NULL,
    short_code   TEXT    UNIQUE NOT NULL,
    clicks       INTEGER DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_links_short_code ON links(short_code);
```

---

## 🎨 Design Philosophy

BitCut's UI is inspired by the **Vibecon** aesthetic — a blend of corporate polish and indie-hacker energy:

- **Blueprint Grid** — Subtle CSS grid overlay on a dark navy background
- **Massive Typography** — Space Grotesk font, all-caps hero text
- **Cyan/Blue Gradient** — Royal blue to cyan gradient on headings
- **Glassmorphic Cards** — Translucent result cards with backdrop blur
- **Micro-Animations** — Float, pulse, slide-up, and shake effects
- **Scrolling Ticker** — Continuous CSS marquee at the bottom of the page
- **Dark-First Design** — Dark theme as the default with smooth light mode toggle

---

<div align="center">

### 👨‍💻 Developed by [Gaurav Singh](https://github.com/gauravsinghshah)

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-gauravsinghshah-181717?style=for-the-badge&logo=github)](https://github.com/gauravsinghshah)

<br/>

**If you found this project useful, give it a ⭐ on GitHub!**

</div>
