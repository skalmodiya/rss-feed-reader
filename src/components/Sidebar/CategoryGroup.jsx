import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { FeedItem } from './FeedItem'

export function CategoryGroup({
  category,
  feeds,
  selectedFeedId,
  setSelectedFeedId,
  selectedCategory,
  setSelectedCategory,
  unreadCountByFeed,
}) {
  const [expanded, setExpanded] = useState(true)
  const categoryUnread = feeds.reduce((sum, f) => sum + (unreadCountByFeed[f.id] || 0), 0)
  const isActive = selectedCategory === category && !selectedFeedId

  return (
    <div className="mb-1">
      <button
        onClick={() => {
          if (expanded) {
            setSelectedCategory(category)
            setSelectedFeedId(null)
          }
          setExpanded((e) => !e)
        }}
        className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        {expanded ? (
          <ChevronDownIcon className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRightIcon className="h-3 w-3 shrink-0" />
        )}
        <span className="truncate flex-1 text-left">{category}</span>
        {categoryUnread > 0 && (
          <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-1.5 py-0.5">
            {categoryUnread}
          </span>
        )}
      </button>

      {expanded && (
        <div className="ml-2">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              selected={selectedFeedId === feed.id}
              onSelect={() => {
                setSelectedFeedId(feed.id)
                setSelectedCategory(null)
              }}
              unreadCount={unreadCountByFeed[feed.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
