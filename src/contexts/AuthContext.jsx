import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storage } from '../lib/storage'
import { getUser } from '../lib/github'
import { GITHUB_CLIENT_ID, OAUTH_PROXY_URL, GITHUB_OAUTH_SCOPE, APP_BASE } from '../constants'

const AuthContext = createContext(null)

function buildOAuthUrl() {
  const redirectUri = window.location.origin + APP_BASE
  return (
    `https://github.com/login/oauth/authorize` +
    `?client_id=${GITHUB_CLIENT_ID}` +
    `&scope=${GITHUB_OAUTH_SCOPE}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  )
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const validateAndStore = useCallback(async (t) => {
    const u = await getUser(t)
    storage.setToken(t)
    setToken(t)
    setUser(u)
  }, [])

  // Validate stored token on mount
  useEffect(() => {
    const stored = storage.getToken()
    if (!stored) { setLoading(false); return }
    validateAndStore(stored)
      .catch(() => storage.clearToken())
      .finally(() => setLoading(false))
  }, [validateAndStore])

  // Handle OAuth callback: ?code=xxx in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    // Clean the URL immediately so refresh doesn't re-trigger
    window.history.replaceState({}, '', window.location.pathname)

    if (!OAUTH_PROXY_URL) {
      setError('OAuth proxy not configured. Please use a Personal Access Token.')
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`${OAUTH_PROXY_URL}?code=${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.access_token) return validateAndStore(data.access_token)
        throw new Error(data.error_description || 'OAuth failed')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [validateAndStore])

  const loginWithGitHub = useCallback(() => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub Client ID not configured.')
      return
    }
    window.location.href = buildOAuthUrl()
  }, [])

  const loginWithPAT = useCallback(async (pat) => {
    setLoading(true)
    setError(null)
    try {
      await validateAndStore(pat)
    } catch {
      storage.clearToken()
      setError('Invalid token — make sure it has the "gist" scope.')
    } finally {
      setLoading(false)
    }
  }, [validateAndStore])

  const logout = useCallback(() => {
    storage.clearToken()
    sessionStorage.removeItem('rss_gist_id')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        setError,
        loginWithGitHub,
        loginWithPAT,
        logout,
        isAuthenticated: !!token && !!user,
        oauthConfigured: !!GITHUB_CLIENT_ID && !!OAUTH_PROXY_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
