import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FeedsProvider } from './contexts/FeedsContext'
import { ArticlesProvider } from './contexts/ArticlesContext'
import { Layout } from './components/Layout'
import { LandingPage } from './components/LandingPage'
import { useTheme } from './hooks/useTheme'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const { theme, setTheme } = useTheme()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage theme={theme} setTheme={setTheme} />
  }

  return (
    <FeedsProvider>
      <ArticlesProvider>
        <Layout theme={theme} setTheme={setTheme} />
      </ArticlesProvider>
    </FeedsProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
