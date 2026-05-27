import { useState, useRef } from 'react'
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../../contexts/FeedsContext'
import { downloadOPML, parseOPML } from '../../lib/opml'

export function ImportExportModal({ onClose }) {
  const { feeds, categories, importFeeds } = useFeeds()
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState('')

  const handleExport = () => {
    downloadOPML(feeds, categories)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setImportResult(null)
    setImporting(true)

    try {
      const text = await file.text()
      const parsed = parseOPML(text)
      if (parsed.length === 0) {
        setError('No valid feed URLs found in the OPML file.')
        return
      }
      const added = await importFeeds(parsed)
      setImportResult({ total: parsed.length, added })
    } catch (err) {
      setError(err.message)
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Import / Export</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {importResult && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
              Imported {importResult.added} new feed{importResult.added !== 1 ? 's' : ''}
              {importResult.total !== importResult.added && ` (${importResult.total - importResult.added} already existed)`}
            </div>
          )}

          {/* Export */}
          <section>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">Export</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Download your {feeds.length} feed{feeds.length !== 1 ? 's' : ''} as an OPML file.
            </p>
            <button
              onClick={handleExport}
              disabled={feeds.length === 0}
              className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download OPML
            </button>
          </section>

          {/* Import */}
          <section>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">Import</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Import feeds from an OPML file. Duplicate URLs will be skipped.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".opml,.xml"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              {importing ? 'Importing...' : 'Choose OPML File'}
            </button>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
