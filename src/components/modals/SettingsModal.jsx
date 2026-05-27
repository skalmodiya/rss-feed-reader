import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../../contexts/FeedsContext'

export function SettingsModal({ onClose }) {
  const { categories, removeCategory, feeds } = useFeeds()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-6">
          {/* Auto-refresh */}
          <section>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">Auto Refresh</h3>
            <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <span className="text-blue-600 dark:text-blue-400 text-lg">🔄</span>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All feeds refresh automatically every <strong>15 minutes</strong> and on every login.
              </p>
            </div>
          </section>

          {/* Categories */}
          <section>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
              Categories ({categories.length})
            </h3>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No categories yet. Add one when creating a feed.</p>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const count = feeds.filter((f) => f.category === cat).length
                  return (
                    <div key={cat} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat} <span className="text-xs text-gray-400">({count})</span>
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove category "${cat}"? Feeds will become uncategorized.`)) {
                            removeCategory(cat)
                          }
                        }}
                        className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Stats */}
          <section>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">About</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{feeds.length} feed{feeds.length !== 1 ? 's' : ''} subscribed</p>
              <p>Feed data stored in your private GitHub Gist</p>
              <p>Read state stored locally in your browser</p>
              <a
                href="https://github.com/skalmodiya/rss-feed-reader"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline block"
              >
                View on GitHub →
              </a>
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
