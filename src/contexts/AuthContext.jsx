import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { storage } from '../lib/storage'
import { getUser } from '../lib/github'
import { GITHUB_CLIENT_ID, GITHUB_OAUTH_SCOPE } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)   // true on mount while we validate stored token
  const [error, setError] = useState(null)

  // Device flow state
  const [deviceFlow, setDeviceFlow] = useState(null)  // { user_code, verification_uri, expires_in }
  const [devicePolling, setDevicePolling] = useState(false)
  const pollRef = useRef(null)

  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current)
    pollRef.current = null
    setDevicePolling(false)
  }, [])

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
      .catch(() => { storage.clearToken() })
      .finally(() => setLoading(false))
  }, [validateAndStore])

  // Start GitHub Device Flow
  const loginWithGitHub = useCallback(async () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub Client ID not configured. Use a Personal Access Token.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, scope: GITHUB_OAUTH_SCOPE }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error_description || data.error)
      // data = { device_code, user_code, verification_uri, expires_in, interval }
      setDeviceFlow(data)
      setDevicePolling(true)

      // Poll for token
      const interval = (data.interval || 5) * 1000
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: GITHUB_CLIENT_ID,
              device_code: data.device_code,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
          })
          const pollData = await pollRes.json()
          if (pollData.access_token) {
            stopPolling()
            setDeviceFlow(null)
            await validateAndStore(pollData.access_token)
            setLoading(false)
          } else if (pollData.error === 'access_denied' || pollData.error === 'expired_token') {
            stopPolling()
            setDeviceFlow(null)
            setError('Authorization was denied or expired. Please try again.')
            setLoading(false)
          }
          // 'authorization_pending' and 'slow_down' → keep polling
        } catch {
          // network hiccup — keep polling
        }
      }, interval)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [validateAndStore, stopPolling])

  const cancelDeviceFlow = useCallback(() => {
    stopPolling()
    setDeviceFlow(null)
    setError(null)
  }, [stopPolling])

  const loginWithPAT = useCallback(async (pat) => {
    setLoading(true)
    setError(null)
    try {
      await validateAndStore(pat)
    } catch {
      storage.clearToken()
      setError('Invalid token. Please check it has the "gist" scope and try again.')
    } finally {
      setLoading(false)
    }
  }, [validateAndStore])

  const logout = useCallback(() => {
    stopPolling()
    storage.clearToken()
    sessionStorage.removeItem('rss_gist_id')
    setToken(null)
    setUser(null)
    setDeviceFlow(null)
    setError(null)
  }, [stopPolling])

  // Clean up poll on unmount
  useEffect(() => () => clearInterval(pollRef.current), [])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        setError,
        deviceFlow,
        devicePolling,
        loginWithGitHub,
        cancelDeviceFlow,
        loginWithPAT,
        logout,
        isAuthenticated: !!token && !!user,
        oauthConfigured: !!GITHUB_CLIENT_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
