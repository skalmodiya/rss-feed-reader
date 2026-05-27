import { useState } from 'react'
import { PlusIcon, XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../../contexts/FeedsContext'
import { useArticles } from '../../contexts/ArticlesContext'
import { FeedItem } from './FeedItem'
import { CategoryGroup } from './CategoryGroup'
import { ImportExportModal } from '../modals/ImportExportModal'

export function Sidebar({ onClose }) {
  const { feeds, categories, syncing } = useFeeds()
  const { selectedFeedId, setSelectedFeedId, selectedCategory, setSelectedCategory, allArticles, readItems, unreadCountByFeed } = useArticles()
  const [showImportExport, setShowImportExport] = useState(false)

  const uncategorized = feeds.filter((f) => !f.category)
  const totalUnread = allArticles.filter((a) => !readItems.has(a.id)).length

  const handleSelectAll = () => {
    setSelectedFeedId(null)
    setSelectedCategory(null)
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">📰</span>
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">RSS Reader</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowImportExport(true)}
              title="Import / Export OPML"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
          {/* All Feeds */}
          <button
            onClick={handleSelectAll}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              !selectedFeedId && !selectedCategory
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span>All Feeds</span>
            {totalUnread > 0 && (
              <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </button>

          {/* Categorized feeds */}
          {categories.map((cat) => (
            <CategoryGroup
              key={cat}
              category={cat}
              feeds={feeds.filter((f) => f.category === cat)}
              selectedFeedId={selectedFeedId}
              setSelectedFeedId={setSelectedFeedId}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              unreadCountByFeed={unreadCountByFeed}
            />
          ))}

          {/* Uncategorized feeds */}
          {uncategorized.length > 0 && (
            <div className="mt-2">
              {categories.length > 0 && (
                <div className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Feeds
                </div>
              )}
              {uncategorized.map((feed) => (
                <FeedItem
                  key={feed.id}
                  feed={feed}
                  selected={selectedFeedId === feed.id}
                  onSelect={() => { setSelectedFeedId(feed.id); setSelectedCategory(null) }}
                  unreadCount={unreadCountByFeed[feed.id] || 0}
                />
              ))}
            </div>
          )}

          {feeds.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              <p className="text-2xl mb-2">📡</p>
              <p>No feeds yet.</p>
              <p className="text-xs mt-1">Click <strong>+ Add Feed</strong> to start.</p>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
          <span>{feeds.length} feed{feeds.length !== 1 ? 's' : ''}</span>
          {syncing && <span className="text-blue-500 animate-pulse">Syncing...</span>}
        </div>
      </div>

      {showImportExport && <ImportExportModal onClose={() => setShowImportExport(false)} />}
    </>
  )
}
