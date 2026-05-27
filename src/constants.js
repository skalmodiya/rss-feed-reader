export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
export const OAUTH_PROXY_URL = import.meta.env.VITE_OAUTH_PROXY_URL || ''

export const APP_BASE = '/rss-feed-reader/'

export const GITHUB_OAUTH_SCOPE = 'gist'

export const GIST_FILENAME = 'rss-feed-reader-data.json'

export const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
]

export const CACHE_TTL_MS = 15 * 60 * 1000
export const AUTO_REFRESH_INTERVALS = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '2 hours', value: 2 * 60 * 60 * 1000 },
]
export const DEFAULT_AUTO_REFRESH_INTERVAL = AUTO_REFRESH_INTERVALS[1].value

export const LS_KEYS = {
  TOKEN: 'rss_reader_gh_token',
  READ_ITEMS: 'rss_reader_read_items',
  THEME: 'rss_reader_theme',
  AUTO_REFRESH: 'rss_reader_auto_refresh',
  AUTO_REFRESH_INTERVAL: 'rss_reader_auto_refresh_interval',
  SIDEBAR_OPEN: 'rss_reader_sidebar_open',
}

export const DEMO_FEEDS = [
  {
    url: 'https://community.sap.com/khhcw49343/rss/board?board.id=hcm-blog-sap',
    title: 'SAP HCM Blog',
    category: 'SAP',
  },
]
