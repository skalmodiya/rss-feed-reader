import { useState } from 'react'
import { useArticles } from '../contexts/ArticlesContext'
import { useFeeds } from '../contexts/FeedsContext'
import { ArticleCard } from './ArticleCard'
import { storage } from '../lib/storage'

const LAYOUTS = [
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="2" width="16" height="2.5" rx="1" />
        <rect x="0" y="6.75" width="16" height="2.5" rx="1" />
        <rect x="0" y="11.5" width="16" height="2.5" rx="1" />
      </svg>
    ),
  },
  {
    id: 'card',
    label: 'Grid',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="0" width="7" height="7" rx="1.5" />
        <rect x="9" y="0" width="7" height="7" rx="1.5" />
        <rect x="0" y="9" width="7" height="7" rx="1.5" />
        <rect x="9" y="9" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'magazine',
    label: 'Magazine',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="1" width="6" height="14" rx="1.5" />
        <rect x="8" y="1" width="8" height="3" rx="1" />
        <rect x="8" y="6" width="8" height="2" rx="1" />
        <rect x="8" y="10" width="8" height="2" rx="1" />
        <rect x="8" y="13" width="5" height="2" rx="1" />
      </svg>
    ),
  },
]

const LS_LAYOUT_KEY = 'rss_reader_layout'

export function ArticleList() {
  const {
    filteredArticles,
    allArticles,
    readItems,
    markRead,
    markUnread,
    markAllRead,
    searchQuery,
    selectedFeedId,
    selectedCategory,
  } = useArticles()
  const { feeds } = useFeeds()

  const [layout, setLayout] = useState(() => localStorage.getItem(LS_LAYOUT_KEY) || 'list')

  const handleLayoutChange = (id) => {
    setLayout(id)
    localStorage.setItem(LS_LAYOUT_KEY, id)
  }

  const feed = selectedFeedId ? feeds.find((f) => f.id === selectedFeedId) : null
  const title = selectedCategory
    ? selectedCategory
    : selectedFeedId
    ? feed?.title || 'Feed'
    : 'All Articles'

  const unreadCount = filteredArticles.filter((a) => !readItems.has(a.id)).length

  return (
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className={`mx-auto px-4 py-4 ${layout === 'card' ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {unreadCount > 0 && <span className="ml-1">· {unreadCount} unread</span>}
              {searchQuery && <span className="ml-1 italic">for "{searchQuery}"</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead(filteredArticles.map((a) => a.id))}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}

            {/* Layout toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLayoutChange(l.id)}
                  title={l.label}
                  className={`p-2 transition-colors ${
                    layout === l.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {l.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            {allArticles.length === 0 ? (
              <>
                <p className="text-4xl mb-3">📡</p>
                <p className="font-medium">No feeds added yet</p>
                <p className="text-sm mt-1">Click <strong className="text-gray-600 dark:text-gray-300">+ Add Feed</strong> to get started</p>
              </>
            ) : searchQuery ? (
              <>
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium">No articles match "{searchQuery}"</p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">All caught up!</p>
              </>
            )}
          </div>
        )}

        {/* Articles */}
        <div className={
          layout === 'card'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
        }>
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={readItems.has(article.id)}
              onMarkRead={markRead}
              onMarkUnread={markUnread}
              layout={layout}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
