import { GIST_FILENAME } from '../constants'

const API = 'https://api.github.com'

async function apiRequest(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getUser(token) {
  return apiRequest(token, 'GET', '/user')
}

export async function findOrCreateGist(token) {
  const cached = sessionStorage.getItem('rss_gist_id')
  if (cached) return cached

  let page = 1
  while (true) {
    const gists = await apiRequest(token, 'GET', `/gists?per_page=100&page=${page}`)
    if (!gists.length) break
    const found = gists.find((g) => g.files[GIST_FILENAME])
    if (found) {
      sessionStorage.setItem('rss_gist_id', found.id)
      return found.id
    }
    if (gists.length < 100) break
    page++
  }

  const defaultData = JSON.stringify({ feeds: [], categories: [] }, null, 2)
  const created = await apiRequest(token, 'POST', '/gists', {
    description: 'RSS Feed Reader — Feed Storage (do not delete)',
    public: false,
    files: { [GIST_FILENAME]: { content: defaultData } },
  })
  sessionStorage.setItem('rss_gist_id', created.id)
  return created.id
}

export async function loadGistData(token) {
  const gistId = await findOrCreateGist(token)
  const gist = await apiRequest(token, 'GET', `/gists/${gistId}`)
  const raw = gist.files[GIST_FILENAME]?.content
  if (!raw) return { feeds: [], categories: [] }
  return JSON.parse(raw)
}

export async function saveGistData(token, data) {
  const gistId = await findOrCreateGist(token)
  await apiRequest(token, 'PATCH', `/gists/${gistId}`, {
    files: {
      [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) },
    },
  })
}
