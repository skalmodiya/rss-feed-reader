import { LS_KEYS, DEFAULT_AUTO_REFRESH_INTERVAL } from '../constants'

export const storage = {
  getToken: () => localStorage.getItem(LS_KEYS.TOKEN),
  setToken: (t) => localStorage.setItem(LS_KEYS.TOKEN, t),
  clearToken: () => localStorage.removeItem(LS_KEYS.TOKEN),

  getReadItems: () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_KEYS.READ_ITEMS) || '[]'))
    } catch {
      return new Set()
    }
  },
  setReadItems: (set) => localStorage.setItem(LS_KEYS.READ_ITEMS, JSON.stringify([...set])),

  getTheme: () => localStorage.getItem(LS_KEYS.THEME) || 'system',
  setTheme: (t) => localStorage.setItem(LS_KEYS.THEME, t),

  getAutoRefresh: () => localStorage.getItem(LS_KEYS.AUTO_REFRESH) === 'true',
  setAutoRefresh: (v) => localStorage.setItem(LS_KEYS.AUTO_REFRESH, String(v)),

  getAutoRefreshInterval: () =>
    parseInt(localStorage.getItem(LS_KEYS.AUTO_REFRESH_INTERVAL) || String(DEFAULT_AUTO_REFRESH_INTERVAL), 10),
  setAutoRefreshInterval: (v) => localStorage.setItem(LS_KEYS.AUTO_REFRESH_INTERVAL, String(v)),
}
