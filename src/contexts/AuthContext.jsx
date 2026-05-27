import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storage } from '../lib/storage'
import { getUser } from '../lib/github'
import { GITHUB_CLIENT_ID, OAUTH_PROXY_URL, GITHUB_OAUTH_SCOPE, APP_BASE } from '../constants'

const AuthContext = createContext(null)

function buildOAuthUrl() {
  const redirectUri = window.location.origin + APP_BASE
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${GITHUB_OAUTH_SCOPE}&redirect_uri=${encodeURIComponent(redirectUri)}`
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.getToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateToken = useCallback(async (t) => {
    setLoading(true)
    setError(null)
    try {
      const u = await getUser(t)
      storage.setToken(t)
      setToken(t)
      setUser(u)
    } catch {
      storage.clearToken()
      setToken(null)
      setUser(null)
      setError('Invalid token. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const existingToken = storage.getToken()
    if (existingToken) validateToken(existingToken)
  }, [validateToken])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    window.history.replaceState({}, '', window.location.pathname)

    if (!OAUTH_PROXY_URL) {
      setError('OAuth proxy URL not configured. Please use a Personal Access Token instead.')
      return
    }

    setLoading(true)
    fetch(`${OAUTH_PROXY_URL}?code=${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.access_token) {
          validateToken(data.access_token)
        } else {
          setError(data.error_description || 'OAuth failed. Please try again.')
          setLoading(false)
        }
      })
      .catch(() => {
        setError('Failed to complete OAuth. Please use a Personal Access Token.')
        setLoading(false)
      })
  }, [validateToken])

  const login = useCallback(() => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub Client ID not configured.')
      return
    }
    window.location.href = buildOAuthUrl()
  }, [])

  const loginWithPAT = useCallback(
    (pat) => validateToken(pat),
    [validateToken]
  )

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
        login,
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
