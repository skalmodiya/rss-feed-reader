import { CORS_PROXIES, CACHE_TTL_MS } from '../constants'

// Pure browser XML parser — no Node.js dependencies

function getText(el, tag) {
  return el.querySelector(tag)?.textContent?.trim() || ''
}

function getAttr(el, tag, attr) {
  return el.querySelector(tag)?.getAttribute(attr) || ''
}

function parseFeedXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) throw new Error('Invalid XML: ' + parseError.textContent.slice(0, 100))

  const isAtom = !!doc.querySelector('feed')
  return isAtom ? parseAtom(doc) : parseRSS(doc)
}

function parseRSS(doc) {
  const channel = doc.querySelector('channel')
  if (!channel) throw new Error('No RSS channel found')

  const feedImageUrl =
    channel.querySelector('image > url')?.textContent?.trim() || ''

  const items = [...doc.querySelectorAll('item')].map((item) => {
    const guid = getText(item, 'guid') || getText(item, 'link')
    const enclosureUrl = item.querySelector('enclosure')?.getAttribute('url') || ''
    const mediaThumbnail =
      item.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || ''
    const mediaContent =
      item.querySelector('media\\:content, content')?.getAttribute('url') || ''
    const contentEncoded =
      item.querySelector('content\\:encoded, encoded')?.textContent?.trim() || ''
    const summary = item.querySelector('description')?.textContent?.trim() || ''
    const pubDate = getText(item, 'pubDate')

    return {
      guid,
      title: getText(item, 'title'),
      link: getText(item, 'link'),
      pubDate,
      isoDate: pubDate ? toISOSafe(pubDate) : '',
      summary: stripHtml(summary).slice(0, 300),
      content: contentEncoded || summary,
      author: getText(item, 'author') || getText(item, 'dc\\:creator, creator'),
      thumbnail: mediaThumbnail || mediaContent || enclosureUrl || extractImageFromContent(contentEncoded || summary),
    }
  })

  return {
    title: getText(channel, 'title'),
    description: getText(channel, 'description'),
    link: getText(channel, 'link'),
    image: { url: feedImageUrl },
    items,
  }
}

function parseAtom(doc) {
  const feed = doc.querySelector('feed')

  const items = [...doc.querySelectorAll('entry')].map((entry) => {
    const id = getText(entry, 'id')
    const link =
      entry.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
      entry.querySelector('link:not([rel])')?.getAttribute('href') ||
      entry.querySelector('link')?.getAttribute('href') || ''
    const summary =
      entry.querySelector('summary')?.textContent?.trim() ||
      entry.querySelector('content')?.textContent?.trim() || ''
    const content = entry.querySelector('content')?.textContent?.trim() || summary
    const published = getText(entry, 'published') || getText(entry, 'updated')

    return {
      guid: id || link,
      title: getText(entry, 'title'),
      link,
      pubDate: published,
      isoDate: published ? toISOSafe(published) : '',
      summary: stripHtml(summary).slice(0, 300),
      content,
      author: getText(entry, 'name') || getText(entry, 'author'),
      thumbnail: extractImageFromContent(content || summary),
    }
  })

  return {
    title: getText(feed, 'title'),
    description: getText(feed, 'subtitle'),
    link:
      feed.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
      feed.querySelector('link')?.getAttribute('href') || '',
    image: { url: '' },
    items,
  }
}

function toISOSafe(dateStr) {
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toISOString()
  } catch {
    return dateStr
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractImageFromContent(html) {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

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
  return parseFeedXML(text)
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
  return (feed.items || []).map((item) => ({
    id: item.guid || `${feedId}-${item.link}-${item.pubDate}`,
    feedId,
    title: item.title || '(no title)',
    link: item.link || '',
    pubDate: item.isoDate || item.pubDate || '',
    summary: item.summary || '',
    content: item.content || '',
    author: item.author || '',
    thumbnail: item.thumbnail || null,
  }))
}

export function getFeedMetadata(feed) {
  return {
    title: feed.title || '',
    description: feed.description || '',
    link: feed.link || '',
    image: feed.image?.url || '',
  }
}

