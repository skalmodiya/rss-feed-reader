import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { fetchFeed, normalizeItems } from '../lib/rss'
import { storage } from '../lib/storage'
import { useFeeds } from './FeedsContext'

const ArticlesContext = createContext(null)

export function ArticlesProvider({ children }) {
  const { feeds } = useFeeds()
  const [articlesByFeed, setArticlesByFeed] = useState({})
  const [feedStatus, setFeedStatus] = useState({})
  const [readItems, setReadItems] = useState(() => storage.getReadItems())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedId, setSelectedFeedId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState(() => storage.getAutoRefreshInterval())
  const timerRef = useRef(null)
  const prevFeedIdsRef = useRef(new Set())
  const initialLoadDoneRef = useRef(false)

  const fetchOneFeed = useCallback(async (feed, forceRefresh = false) => {
    setFeedStatus((prev) => ({ ...prev, [feed.id]: { ...prev[feed.id], loading: true, error: null } }))
    try {
      const { data } = await fetchFeed(feed.url, forceRefresh)
      const items = normalizeItems(data, feed.id)
      setArticlesByFeed((prev) => ({ ...prev, [feed.id]: items }))
      setFeedStatus((prev) => ({
        ...prev,
        [feed.id]: { loading: false, error: null, lastFetched: Date.now(), itemCount: items.length },
      }))
    } catch (err) {
      setFeedStatus((prev) => ({
        ...prev,
        [feed.id]: { ...prev[feed.id], loading: false, error: err.message, lastFetched: null },
      }))
    }
  }, [])

  const fetchAllFeeds = useCallback(
    (feedList, forceRefresh = false) => {
      feedList.forEach((feed) => fetchOneFeed(feed, forceRefresh))
    },
    [fetchOneFeed]
  )

  useEffect(() => {
    const currentIds = new Set(feeds.map((f) => f.id))
    const newFeeds = feeds.filter((f) => !prevFeedIdsRef.current.has(f.id))
    const removedIds = [...prevFeedIdsRef.current].filter((id) => !currentIds.has(id))

    if (newFeeds.length) {
      // Force refresh on the very first load (login), use cache for newly added feeds
      fetchAllFeeds(newFeeds, !initialLoadDoneRef.current)
      initialLoadDoneRef.current = true
    }
    if (removedIds.length) {
      setArticlesByFeed((prev) => {
        const next = { ...prev }
        removedIds.forEach((id) => delete next[id])
        return next
      })
      setFeedStatus((prev) => {
        const next = { ...prev }
        removedIds.forEach((id) => delete next[id])
        return next
      })
    }
    prevFeedIdsRef.current = currentIds
  }, [feeds, fetchAllFeeds])

  // Auto-refresh all feeds every 15 minutes, always on
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!feeds.length) return
    timerRef.current = setInterval(() => fetchAllFeeds(feeds, true), 15 * 60 * 1000)
    return () => clearInterval(timerRef.current)
  }, [feeds, fetchAllFeeds])

  const setAutoRefresh = useCallback((v) => {
    setAutoRefreshState(v)
    storage.setAutoRefresh(v)
  }, [])

  const setAutoRefreshInterval = useCallback((v) => {
    setAutoRefreshIntervalState(v)
    storage.setAutoRefreshInterval(v)
  }, [])

  const markRead = useCallback((id) => {
    setReadItems((prev) => {
      const updated = new Set([...prev, id])
      storage.setReadItems(updated)
      return updated
    })
  }, [])

  const markUnread = useCallback((id) => {
    setReadItems((prev) => {
      const updated = new Set([...prev])
      updated.delete(id)
      storage.setReadItems(updated)
      return updated
    })
  }, [])

  const markAllRead = useCallback((ids) => {
    setReadItems((prev) => {
      const updated = new Set([...prev, ...ids])
      storage.setReadItems(updated)
      return updated
    })
  }, [])

  const allArticles = useMemo(() => {
    return Object.values(articlesByFeed)
      .flat()
      .sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate) : 0
        const db = b.pubDate ? new Date(b.pubDate) : 0
        return db - da
      })
  }, [articlesByFeed])

  const filteredArticles = useMemo(() => {
    let result = allArticles
    if (selectedFeedId) {
      result = result.filter((a) => a.feedId === selectedFeedId)
    } else if (selectedCategory) {
      const feedIdsInCat = new Set(
        feeds.filter((f) => f.category === selectedCategory).map((f) => f.id)
      )
      result = result.filter((a) => feedIdsInCat.has(a.feedId))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q)
      )
    }
    return result
  }, [allArticles, selectedFeedId, selectedCategory, searchQuery, feeds])

  const unreadCountByFeed = useMemo(() => {
    const counts = {}
    allArticles.forEach((a) => {
      if (!readItems.has(a.id)) {
        counts[a.feedId] = (counts[a.feedId] || 0) + 1
      }
    })
    return counts
  }, [allArticles, readItems])

  return (
    <ArticlesContext.Provider
      value={{
        allArticles,
        filteredArticles,
        feedStatus,
        readItems,
        searchQuery,
        setSearchQuery,
        selectedFeedId,
        setSelectedFeedId,
        selectedCategory,
        setSelectedCategory,
        autoRefresh,
        setAutoRefresh,
        autoRefreshInterval,
        setAutoRefreshInterval,
        markRead,
        markUnread,
        markAllRead,
        unreadCountByFeed,
        refreshFeed: (id) => {
          const feed = feeds.find((f) => f.id === id)
          if (feed) fetchOneFeed(feed, true)
        },
        refreshAll: async () => {
          setIsRefreshing(true)
          await Promise.allSettled(feeds.map((f) => fetchOneFeed(f, true)))
          setIsRefreshing(false)
        },
        isRefreshing,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  )
}

export const useArticles = () => useContext(ArticlesContext)
