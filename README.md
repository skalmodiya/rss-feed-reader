# RSS Feed Reader

A **free, open-source** RSS/Atom feed reader that runs entirely in your browser. No backend, no database, no subscription fees. Your feed list syncs across devices using your own **private GitHub Gist**.

**Live App:** https://skalmodiya.github.io/rss-feed-reader/

---

## Features

- **RSS & Atom Support** — reads all standard feed formats via CORS proxy with automatic fallback
- **GitHub Gist Sync** — feed URLs stored in your private Gist, accessible from any device
- **Categories** — organize feeds into custom folders/categories
- **Read Tracking** — mark articles as read/unread (stored locally in your browser)
- **Search & Filter** — real-time search across all loaded article titles and summaries
- **OPML Import/Export** — standard format for moving feeds between readers
- **Auto Refresh** — optional background refresh at configurable intervals
- **Dark / Light / System** theming
- **Responsive** — works on mobile, tablet, and desktop
- **No tracking, no ads** — your feed list is in your own GitHub account

---

## Getting Started

### Option 1: Use the hosted app (Recommended)

1. Go to **https://skalmodiya.github.io/rss-feed-reader/**
2. Click **"Use a Personal Access Token"**
3. Create a [GitHub PAT](https://github.com/settings/tokens/new?scopes=gist&description=RSS+Feed+Reader) with `gist` scope
4. Paste the token and click **Connect**
5. Start adding feeds!

> **Note:** The hosted app uses PAT auth by default. To enable GitHub OAuth (one-click sign-in), you need to set up your own OAuth App and Cloudflare Worker — see [Self-Hosting](#self-hosting) below.

---

## Adding Feeds

1. Click **+ Add Feed** in the top bar
2. Paste the RSS/Atom feed URL
3. Click the search icon to auto-detect the feed title
4. Optionally assign a category
5. Click **Add Feed**

**Example feed URL:** `https://community.sap.com/khhcw49343/rss/board?board.id=hcm-blog-sap`

---

## Using the App

### Sidebar
- Click **All Feeds** to see all articles
- Click a **category name** to see articles from all feeds in that category
- Click an **individual feed** to see only that feed's articles
- Hover a feed item → **Refresh** or **Remove** buttons appear

### Articles
- Click an article card to open it in a new tab (marks it as read)
- **Right-click** an article to toggle read/unread
- Click **Mark all read** to clear all unread badges
- Unread articles have a blue dot and are shown at full opacity

### Search
- Use the search bar in the header to filter articles in real time
- Search matches article titles, summaries, and authors

### OPML Import / Export
- Click the export icon (↑) in the sidebar header
- **Export:** Downloads all your feeds as an OPML file
- **Import:** Upload an OPML file to bulk-add feeds (duplicates are skipped)

### Settings
- Click the gear icon (⚙) in the header
- Toggle **auto-refresh** and configure the interval
- Manage and delete categories

---

## Data & Privacy

| What | Where stored |
|------|-------------|
| Feed URLs & categories | Your private GitHub Gist (`rss-feed-reader-data.json`) |
| Read/unread state | Your browser's `localStorage` |
| Theme preference | Your browser's `localStorage` |
| GitHub access token | Your browser's `localStorage` |
| Article content | Never stored — fetched live from the source |

Feed XML is fetched at runtime through a public CORS proxy. The actual article links always point to the original publisher's site.

---

## Self-Hosting

### 1. Fork the repository

```bash
git clone https://github.com/skalmodiya/rss-feed-reader
cd rss-feed-reader
npm install
```

### 2. Set up GitHub OAuth (optional, enables one-click sign-in)

**a. Create a GitHub OAuth App:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Set **Homepage URL** to `https://YOUR_USERNAME.github.io/rss-feed-reader/`
3. Set **Authorization callback URL** to `https://YOUR_USERNAME.github.io/rss-feed-reader/`
4. Note your **Client ID** and generate a **Client Secret**

**b. Deploy the Cloudflare Worker (OAuth proxy):**
1. Sign up at [cloudflare.com](https://cloudflare.com) (free tier, no credit card required)
2. Go to **Workers & Pages** → **Create Worker**
3. Paste the code from `workers/oauth-proxy/index.js`
4. In the Worker's settings → **Variables**, add:
   - `GITHUB_CLIENT_ID` → your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` → your OAuth App Client Secret
   - `ALLOWED_ORIGIN` → `https://YOUR_USERNAME.github.io` (no trailing slash)
5. Note the Worker URL (e.g. `https://rss-oauth-proxy.your-username.workers.dev`)

### 3. Configure GitHub Actions secrets

In your repo → **Settings** → **Secrets and variables** → **Actions**, add:
- `VITE_GITHUB_CLIENT_ID` — your OAuth App Client ID
- `VITE_OAUTH_PROXY_URL` — your Cloudflare Worker URL

### 4. Enable GitHub Pages

In your repo → **Settings** → **Pages**:
- Source: **Deploy from a branch**
- Branch: `gh-pages` / root `/`

### 5. Push to deploy

Push to `main` — GitHub Actions will build and deploy automatically.

### Local development

```bash
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS v4 |
| RSS Parsing | rss-parser |
| Icons | Heroicons |
| Date formatting | date-fns |
| Auth | GitHub OAuth / Personal Access Token |
| Sync | GitHub Gist API |
| Feed fetching | allorigins.win → corsproxy.io (fallback chain) |
| Hosting | GitHub Pages |
| OAuth proxy | Cloudflare Workers (free tier) |

---

## Contributing

Bug reports and pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT
