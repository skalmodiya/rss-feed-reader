export function exportOPML(feeds, categories) {
  const feedsByCategory = {}
  feeds.forEach((f) => {
    const cat = f.category || 'Uncategorized'
    if (!feedsByCategory[cat]) feedsByCategory[cat] = []
    feedsByCategory[cat].push(f)
  })

  const outlines = Object.entries(feedsByCategory)
    .map(
      ([cat, items]) => `
    <outline text="${escapeXml(cat)}" title="${escapeXml(cat)}">
      ${items.map((f) => `<outline type="rss" text="${escapeXml(f.title || f.url)}" title="${escapeXml(f.title || f.url)}" xmlUrl="${escapeXml(f.url)}" />`).join('\n      ')}
    </outline>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>RSS Feed Reader Export</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>${outlines}
  </body>
</opml>`
}

export function parseOPML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) throw new Error('Invalid OPML file')

  const feeds = []
  doc.querySelectorAll('outline[xmlUrl]').forEach((node) => {
    const url = node.getAttribute('xmlUrl')
    if (!url) return
    const parentCat = node.parentElement?.getAttribute('text') || node.parentElement?.getAttribute('title')
    const category = parentCat && parentCat !== 'body' ? parentCat : 'Imported'
    feeds.push({
      url,
      title: node.getAttribute('title') || node.getAttribute('text') || url,
      category,
    })
  })
  return feeds
}

function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function downloadOPML(feeds, categories) {
  const xml = exportOPML(feeds, categories)
  const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rss-feeds-${new Date().toISOString().slice(0, 10)}.opml`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
