import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../../contexts/FeedsContext'
import { fetchFeed, getFeedMetadata } from '../../lib/rss'

export function AddFeedModal({ onClose }) {
  const { feeds, categories, addFeed } = useFeeds()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isDuplicate = feeds.some((f) => f.url === url.trim())

  const detectTitle = async () => {
    if (!url.trim()) return
    setDetecting(true)
    setError('')
    try {
      const { data } = await fetchFeed(url.trim())
      const meta = getFeedMetadata(data)
      if (meta.title) setTitle(meta.title)
    } catch {
      setError('Could not load feed. Check the URL and try again.')
    } finally {
      setDetecting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    if (isDuplicate) { setError('This feed URL is already added.'); return }

    const finalCategory = showNewCat ? newCategory.trim() : category
    setSaving(true)
    try {
      await addFeed({ url: url.trim(), title: title.trim(), category: finalCategory })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Add RSS Feed</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Feed URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError('') }}
                placeholder="https://example.com/feed.xml"
                required
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={detectTitle}
                disabled={!url || detecting}
                title="Auto-detect title"
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                {detecting ? (
                  <span className="h-4 w-4 block animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                ) : (
                  <MagnifyingGlassIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {isDuplicate && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">This feed is already in your list.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-gray-400">(optional, auto-detected)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Feed"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-gray-400">(optional)</span>
            </label>
            {!showNewCat ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCat(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => { setShowNewCat(false); setNewCategory('') }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url || isDuplicate || saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding...' : 'Add Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
