import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'

const FEATURES = [
  { icon: '📡', title: 'RSS & Atom', desc: 'Supports all major feed formats with automatic detection.' },
  { icon: '☁️', title: 'Sync via Gist', desc: 'Feed URLs stored in your private GitHub Gist. Accessible everywhere.' },
  { icon: '🏷️', title: 'Categories', desc: 'Organize feeds into custom categories and folders.' },
  { icon: '✅', title: 'Read Tracking', desc: 'Mark articles as read/unread. State persisted locally.' },
  { icon: '🔍', title: 'Search', desc: 'Instantly search and filter across all loaded articles.' },
  { icon: '📂', title: 'OPML', desc: 'Import and export your feed list in standard OPML format.' },
]

export function LandingPage({ theme, setTheme }) {
  const { login, loginWithPAT, loading, error, setError, oauthConfigured } = useAuth()
  const [showPAT, setShowPAT] = useState(!oauthConfigured)
  const [pat, setPat] = useState('')
  const [patLoading, setPatLoading] = useState(false)

  const handlePATSubmit = async (e) => {
    e.preventDefault()
    if (!pat.trim()) return
    setPatLoading(true)
    await loginWithPAT(pat.trim())
    setPatLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <span className="text-6xl">📰</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RSS Feed Reader
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 max-w-2xl mx-auto">
          Free, open-source RSS reader. Your feeds synced privately via GitHub Gist.
          No server. No ads. Just your content.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Sign in with GitHub to get started — your feed list is stored in your own private Gist.
        </p>

        {error && (
          <div className="mb-4 mx-auto max-w-md rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 mb-4">
          {oauthConfigured && !showPAT && (
            <button
              onClick={login}
              disabled={loading}
              className="flex items-center gap-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold text-base hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {loading ? 'Connecting...' : 'Sign in with GitHub'}
            </button>
          )}

          {!showPAT && (
            <button
              onClick={() => setShowPAT(true)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Use a Personal Access Token instead
            </button>
          )}

          {showPAT && (
            <form onSubmit={handlePATSubmit} className="flex flex-col items-center gap-2 w-full max-w-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist&description=RSS+Feed+Reader"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  GitHub PAT
                </a>{' '}
                with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">gist</code> scope
              </p>
              <div className="flex gap-2 w-full">
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={patLoading || !pat}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {patLoading ? '...' : 'Connect'}
                </button>
              </div>
              {oauthConfigured && (
                <button
                  type="button"
                  onClick={() => setShowPAT(false)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Back to GitHub OAuth
                </button>
              )}
            </form>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 text-left shadow-sm"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-gray-400 dark:text-gray-600">
          Open source · No backend · Your data in your Gist ·{' '}
          <a
            href="https://github.com/skalmodiya/rss-feed-reader"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-400"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
