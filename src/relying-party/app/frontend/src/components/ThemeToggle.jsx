import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
    const THEME_KEY = 'relying-party-theme'
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
            localStorage.setItem(THEME_KEY, 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem(THEME_KEY, 'light')
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle Theme"
            title="Toggle Theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    )
}
