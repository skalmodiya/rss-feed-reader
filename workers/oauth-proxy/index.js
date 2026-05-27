// Cloudflare Worker — OAuth token exchange proxy
// Deploy this at: https://dash.cloudflare.com > Workers & Pages > Create Worker
// Set environment variables via the dashboard (not hardcoded):
//   GITHUB_CLIENT_ID    — from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET — from your GitHub OAuth App
//   ALLOWED_ORIGIN      — https://skalmodiya.github.io (no trailing slash)

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://skalmodiya.github.io'

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'missing_code', error_description: 'No code provided' }),
        { status: 400, headers: corsHeaders }
      )
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      })

      const data = await tokenRes.json()
      // data = { access_token, token_type, scope } on success
      // data = { error, error_description } on failure
      return new Response(JSON.stringify(data), { headers: corsHeaders })
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'proxy_error', error_description: err.message }),
        { status: 500, headers: corsHeaders }
      )
    }
  },
}
