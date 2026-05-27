import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

const OPTIONS = [
  { value: 'light', icon: SunIcon, label: 'Light' },
  { value: 'dark', icon: MoonIcon, label: 'Dark' },
  { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
]

export function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 gap-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`p-1.5 rounded-md transition-colors ${
            theme === value
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
