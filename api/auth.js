// Vercel serverless function — OAuth code → token exchange
// Deployed automatically when repo is connected to Vercel
// Set environment variables in Vercel dashboard:
//   GITHUB_CLIENT_ID     — your GitHub OAuth App Client ID
//   GITHUB_CLIENT_SECRET — your GitHub OAuth App Client Secret

export default async function handler(req, res) {
  const ALLOWED_ORIGIN = 'https://skalmodiya.github.io'

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const code = req.query.code
  if (!code) {
    return res.status(400).json({ error: 'missing_code' })
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'proxy_error', message: err.message })
  }
}
