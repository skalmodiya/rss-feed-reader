import Parser from 'rss-parser'
import { CORS_PROXIES, CACHE_TTL_MS } from '../constants'

const parser = new Parser({
  timeout: 15000,
  customFields: {
    feed: ['language', 'managingEditor'],
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
})

async function fetchWithProxy(url, proxyFn) {
  const proxyUrl = proxyFn(url)
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  let text
  if (proxyUrl.includes('allorigins.win')) {
    const json = await res.json()
    if (json.status?.http_code && json.status.http_code !== 200) {
      throw new Error(`Origin returned ${json.status.http_code}`)
    }
    text = json.contents
  } else {
    text = await res.text()
  }

  if (!text) throw new Error('Empty response from proxy')
  return parser.parseString(text)
}

export async function fetchFeed(url) {
  const cacheKey = `rss_cache_${url}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      const { data, fetchedAt } = JSON.parse(cached)
      if (Date.now() - fetchedAt < CACHE_TTL_MS) return { data, fromCache: true }
    } catch {
      sessionStorage.removeItem(cacheKey)
    }
  }

  let lastError
  for (const proxyFn of CORS_PROXIES) {
    try {
      const data = await fetchWithProxy(url, proxyFn)
      sessionStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now() }))
      return { data, fromCache: false }
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`Failed to fetch feed: ${lastError?.message}`)
}

export function normalizeItems(feed, feedId) {
  return (feed.items || []).map((item) => {
    const thumbnail =
      item['media:thumbnail']?.$.url ||
      item['media:content']?.$.url ||
      item.enclosure?.url ||
      extractImageFromContent(item.content || item['content:encoded'] || '')

    return {
      id: item.guid || item.id || `${feedId}-${item.link}-${item.pubDate}`,
      feedId,
      title: item.title || '(no title)',
      link: item.link || '',
      pubDate: item.isoDate || item.pubDate || '',
      summary: item.contentSnippet || item.summary || '',
      content: item.content || item['content:encoded'] || '',
      author: item.creator || item.author || '',
      thumbnail,
    }
  })
}

function extractImageFromContent(html) {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

export function getFeedMetadata(feed) {
  return {
    title: feed.title || '',
    description: feed.description || '',
    link: feed.link || '',
    image: feed.image?.url || '',
    language: feed.language || '',
    lastBuildDate: feed.lastBuildDate || '',
  }
}
