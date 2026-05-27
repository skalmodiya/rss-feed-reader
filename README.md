# RSS Feed Reader

A **free, open-source** RSS/Atom feed reader that runs entirely in your browser. No backend, no database, no subscription fees. Your feed list syncs across devices using your own **private GitHub Gist**.

**Live App:** https://skalmodiya.github.io/rss-feed-reader/
**Repo:** https://github.com/skalmodiya/rss-feed-reader

---

## Features

- **RSS & Atom Support** — reads all standard feed formats via CORS proxy with automatic fallback
- **GitHub OAuth Sign-in** — one-click sign-in with your GitHub account
- **Personal Access Token** — alternative sign-in without OAuth setup
- **GitHub Gist Sync** — feed URLs and categories stored in your private Gist, accessible from any device
- **Categories** — organize feeds into custom folders/categories
- **Read Tracking** — mark articles as read/unread (stored locally in your browser)
- **Search & Filter** — real-time search across all loaded article titles, summaries, and authors
- **Author & Date** — see who published an article and when, in all layout modes
- **3 Layout Modes** — switch between List, Grid, and Magazine views
- **OPML Import/Export** — standard format for moving feeds between readers
- **Auto Refresh** — all feeds refresh on every login and every 15 minutes automatically
- **Manual Refresh** — refresh all feeds instantly via the header button
- **Dark / Light / System** theming
- **Responsive** — works on mobile, tablet, and desktop
- **No tracking, no ads** — your data stays in your own GitHub account

---

## Getting Started

### Sign in with GitHub (Recommended)

1. Go to **https://skalmodiya.github.io/rss-feed-reader/**
2. Click **"Sign in with GitHub"**
3. Authorize the app on GitHub
4. You're in — start adding feeds!

### Sign in with a Personal Access Token

Use this if you prefer not to use OAuth:

1. Go to **https://skalmodiya.github.io/rss-feed-reader/**
2. Click **"Use a Personal Access Token instead"**
3. Create a [GitHub PAT](https://github.com/settings/tokens/new?scopes=gist&description=RSS+Feed+Reader) with `gist` scope only
4. Paste the token and click **Connect**

---

## Adding Feeds

1. Click **+ Add Feed** in the header
2. Paste the RSS/Atom feed URL
3. Click the search icon — the feed title is detected automatically
4. Optionally pick or create a category
5. Click **Add Feed**

**Example feed URL:** `https://community.sap.com/khhcw49343/rss/board?board.id=hcm-blog-sap`

---

## Using the App

### Sidebar
- Click **All Feeds** to see articles from every feed
- Click a **category name** to filter to that category's feeds
- Click an **individual feed** to see only that feed's articles
- Hover over a feed → **Refresh** (↻) and **Remove** (🗑) buttons appear
- The coloured dot on each feed shows its status: green = OK, yellow = loading, red = error

### Articles
- **Click** an article to open it in a new tab (automatically marks it as read)
- **Right-click** an article to toggle read/unread without opening it
- Click **Mark all read** to clear all unread badges at once
- Unread articles have a blue dot indicator

### Layout Modes
Use the toggle buttons (top-right of the article list) to switch views:

| Icon | Mode | Best for |
|------|------|----------|
| ≡ | **List** | Scanning many articles quickly |
| ⊞ | **Grid** | Visual browsing with images |
| ▤ | **Magazine** | Reading with full excerpt and large image |

Your chosen layout is saved and restored on next visit.

### Author & Date
Every article shows:
- **Feed source** — which feed it came from
- **Author** — who wrote it (when provided by the feed)
- **Published date** — relative time (e.g. "3 hours ago"), hover for exact date and time

### Search
- Type in the search bar in the header to filter articles in real time
- Matches article titles, summaries, and author names

### Auto Refresh
- All feeds are **force-refreshed on every login** — you always see the latest content
- Feeds **auto-refresh every 15 minutes** while the app is open
- Click the **↻ button** in the header to manually refresh all feeds immediately (button spins while refreshing)

### OPML Import / Export
- Click the **export icon** (↑) in the sidebar footer
- **Export:** Downloads all your feeds as a standard `.opml` file
- **Import:** Upload an `.opml` file to bulk-add feeds (duplicates are skipped automatically)

### Settings
Click the **⚙ gear icon** in the header to open Settings:
- **Auto Refresh** — shows current refresh policy (15 min, always on)
- **Categories** — lists all your categories with feed counts; click 🗑 to delete a category (feeds in it become uncategorized, not deleted)
- **About** — feed count, storage info, and link to the repo

### Theme
Click the theme toggle in the header to switch between:
- ☀️ **Light**
- 🌙 **Dark**
- 💻 **System** (follows your OS setting)

---

## Data & Privacy

| What | Where stored |
|------|-------------|
| Feed URLs & categories | Your private GitHub Gist (`rss-feed-reader-data.json`) |
| Read/unread state | Your browser's `localStorage` |
| Theme & layout preference | Your browser's `localStorage` |
| GitHub access token | Your browser's `localStorage` |
| Article content | Never stored — fetched live from the source |

Feed XML is fetched at runtime through a public CORS proxy chain (`codetabs` → `allorigins` → `corsproxy.io`). Article links always point to the original publisher's site.

---

## Self-Hosting

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/rss-feed-reader
cd rss-feed-reader
npm install
```

### 2. Create a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Set **Homepage URL** to `https://YOUR_USERNAME.github.io/rss-feed-reader/`
3. Set **Authorization callback URL** to `https://YOUR_USERNAME.github.io/rss-feed-reader/`
4. Note your **Client ID** and generate a **Client Secret**

### 3. Deploy the OAuth proxy to Vercel

The repo includes a ready-to-use Vercel serverless function at `api/auth.js` that handles the OAuth token exchange.

1. Connect your forked repo to [vercel.com](https://vercel.com)
2. In Vercel → Project Settings → **Environment Variables**, add:
   - `GITHUB_CLIENT_ID` — your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` — your OAuth App Client Secret
3. In Vercel → Project Settings → **Deployment Protection** → disable (so the endpoint is publicly accessible)
4. Note your Vercel production URL (e.g. `https://rss-feed-reader-eight.vercel.app`)

### 4. Add GitHub Actions secrets

In your repo → **Settings** → **Secrets and variables** → **Actions**, add:
- `VITE_GITHUB_CLIENT_ID` — your OAuth App Client ID
- `VITE_OAUTH_PROXY_URL` — `https://YOUR_VERCEL_URL/api/auth`

### 5. Enable GitHub Pages

In your repo → **Settings** → **Pages**:
- Source: **Deploy from a branch**
- Branch: `gh-pages` / root `/`

### 6. Push to deploy

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

### Local development

```bash
cp .env.example .env.local
# Add your VITE_GITHUB_CLIENT_ID to .env.local
npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS v4 |
| RSS Parsing | Native browser `DOMParser` (RSS 2.0 + Atom 1.0) |
| Icons | Heroicons |
| Date formatting | date-fns |
| Auth | GitHub OAuth Web Flow / Personal Access Token |
| Sync | GitHub Gist API |
| Feed fetching | codetabs → allorigins → corsproxy.io (fallback chain) |
| Hosting | GitHub Pages |
| OAuth proxy | Vercel Serverless Function (free tier) |
| CI/CD | GitHub Actions |

---

## Contributing

Bug reports and pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT
