import { useArticles } from '../contexts/ArticlesContext'
import { useFeeds } from '../contexts/FeedsContext'
import { ArticleCard } from './ArticleCard'

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

  const feed = selectedFeedId ? feeds.find((f) => f.id === selectedFeedId) : null
  const title = selectedCategory
    ? selectedCategory
    : selectedFeedId
    ? feed?.title || 'Feed'
    : 'All Articles'

  const unreadCount = filteredArticles.filter((a) => !readItems.has(a.id)).length

  return (
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {unreadCount > 0 && <span className="ml-1">· {unreadCount} unread</span>}
              {searchQuery && <span className="ml-1 italic">for "{searchQuery}"</span>}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead(filteredArticles.map((a) => a.id))}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
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

        {/* Article grid */}
        <div className="flex flex-col gap-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={readItems.has(article.id)}
              onMarkRead={markRead}
              onMarkUnread={markUnread}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
