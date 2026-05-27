import { useState } from 'react'
import { Bars3Icon, ArrowPathIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useArticles } from '../contexts/ArticlesContext'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { AddFeedModal } from './modals/AddFeedModal'
import { SettingsModal } from './modals/SettingsModal'

export function Header({ onMenuClick, theme, setTheme }) {
  const { searchQuery, setSearchQuery, refreshAll } = useArticles()
  const { user, logout } = useAuth()
  const [showAddFeed, setShowAddFeed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <>
      <header className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full max-w-md pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 placeholder:text-gray-400"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={refreshAll}
            title="Refresh all feeds"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowAddFeed(true)}
            title="Add feed"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Add Feed</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          <ThemeToggle theme={theme} setTheme={setTheme} />

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.login} className="h-7 w-7 rounded-full" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.login?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-9 z-50 w-40 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl py-1">
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {user?.login}
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); logout() }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAddFeed && <AddFeedModal onClose={() => setShowAddFeed(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
