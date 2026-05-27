import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { loadGistData, saveGistData } from '../lib/github'
import { useAuth } from './AuthContext'

const FeedsContext = createContext(null)

export function FeedsProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const [feeds, setFeeds] = useState([])
  const [categories, setCategories] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const saveQueueRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setFeeds([])
      setCategories([])
      return
    }
    setSyncing(true)
    setSyncError(null)
    loadGistData(token)
      .then((data) => {
        setFeeds(data.feeds || [])
        setCategories(data.categories || [])
      })
      .catch((err) => setSyncError(err.message))
      .finally(() => setSyncing(false))
  }, [isAuthenticated, token])

  const persist = useCallback(
    async (newFeeds, newCategories) => {
      if (!token) return
      clearTimeout(saveQueueRef.current)
      saveQueueRef.current = setTimeout(async () => {
        setSyncError(null)
        try {
          await saveGistData(token, { feeds: newFeeds, categories: newCategories })
        } catch (err) {
          setSyncError(err.message)
        }
      }, 500)
    },
    [token]
  )

  const addFeed = useCallback(
    async ({ url, title, category }) => {
      const newFeed = {
        id: uuidv4(),
        url: url.trim(),
        title: title.trim() || url.trim(),
        category: category?.trim() || '',
        addedAt: new Date().toISOString(),
      }
      const newFeeds = [...feeds, newFeed]
      const newCategories =
        newFeed.category && !categories.includes(newFeed.category)
          ? [...categories, newFeed.category]
          : categories
      setFeeds(newFeeds)
      setCategories(newCategories)
      await persist(newFeeds, newCategories)
      return newFeed
    },
    [feeds, categories, persist]
  )

  const removeFeed = useCallback(
    async (id) => {
      const newFeeds = feeds.filter((f) => f.id !== id)
      setFeeds(newFeeds)
      await persist(newFeeds, categories)
    },
    [feeds, categories, persist]
  )

  const updateFeed = useCallback(
    async (id, updates) => {
      const newFeeds = feeds.map((f) => (f.id === id ? { ...f, ...updates } : f))
      const newCategories = [...new Set(newFeeds.map((f) => f.category).filter(Boolean))]
      const merged = [...new Set([...categories, ...newCategories])]
      setFeeds(newFeeds)
      if (updates.category) setCategories(merged)
      await persist(newFeeds, updates.category ? merged : categories)
    },
    [feeds, categories, persist]
  )

  const addCategory = useCallback(
    async (name) => {
      if (!name || categories.includes(name)) return
      const newCats = [...categories, name]
      setCategories(newCats)
      await persist(feeds, newCats)
    },
    [feeds, categories, persist]
  )

  const removeCategory = useCallback(
    async (name) => {
      const newFeeds = feeds.map((f) => (f.category === name ? { ...f, category: '' } : f))
      const newCats = categories.filter((c) => c !== name)
      setFeeds(newFeeds)
      setCategories(newCats)
      await persist(newFeeds, newCats)
    },
    [feeds, categories, persist]
  )

  const importFeeds = useCallback(
    async (feedsToImport) => {
      const existingUrls = new Set(feeds.map((f) => f.url))
      const newOnes = feedsToImport
        .filter((f) => !existingUrls.has(f.url))
        .map((f) => ({ ...f, id: uuidv4(), addedAt: new Date().toISOString() }))
      const merged = [...feeds, ...newOnes]
      const allCats = [...new Set([...categories, ...newOnes.map((f) => f.category).filter(Boolean)])]
      setFeeds(merged)
      setCategories(allCats)
      await persist(merged, allCats)
      return newOnes.length
    },
    [feeds, categories, persist]
  )

  return (
    <FeedsContext.Provider
      value={{
        feeds,
        categories,
        syncing,
        syncError,
        addFeed,
        removeFeed,
        updateFeed,
        addCategory,
        removeCategory,
        importFeeds,
      }}
    >
      {children}
    </FeedsContext.Provider>
  )
}

export const useFeeds = () => useContext(FeedsContext)
