import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'

export function useTheme() {
  const [theme, setThemeState] = useState(() => storage.getTheme())

  useEffect(() => {
    const apply = (t) => {
      const root = document.documentElement
      if (t === 'dark') {
        root.classList.add('dark')
      } else if (t === 'light') {
        root.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      }
    }

    apply(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => root.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (t) => {
    setThemeState(t)
    storage.setTheme(t)
  }

  return { theme, setTheme }
}
