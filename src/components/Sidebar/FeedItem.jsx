import { useState } from 'react'
import { TrashIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../../contexts/FeedsContext'
import { useArticles } from '../../contexts/ArticlesContext'

export function FeedItem({ feed, selected, onSelect, unreadCount }) {
  const { removeFeed } = useFeeds()
  const { feedStatus, refreshFeed } = useArticles()
  const [showActions, setShowActions] = useState(false)
  const status = feedStatus[feed.id]

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors mb-0.5 ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      {/* Status dot */}
      <span
        className={`shrink-0 h-2 w-2 rounded-full ${
          status?.loading
            ? 'bg-yellow-400 animate-pulse'
            : status?.error
            ? 'bg-red-400'
            : 'bg-green-400'
        }`}
        title={status?.error || (status?.loading ? 'Loading...' : 'OK')}
      />

      <span className="flex-1 truncate text-xs">{feed.title || feed.url}</span>

      {unreadCount > 0 && (
        <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-1.5 py-0.5 shrink-0">
          {unreadCount}
        </span>
      )}

      {/* Action buttons (visible on hover) */}
      <div
        className="hidden group-hover:flex items-center gap-0.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => refreshFeed(feed.id)}
          title="Refresh"
          className="p-1 rounded text-gray-400 hover:text-blue-500"
        >
          <ArrowPathIcon className="h-3 w-3" />
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove feed "${feed.title || feed.url}"?`)) {
              removeFeed(feed.id)
            }
          }}
          title="Remove"
          className="p-1 rounded text-gray-400 hover:text-red-500"
        >
          <TrashIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
