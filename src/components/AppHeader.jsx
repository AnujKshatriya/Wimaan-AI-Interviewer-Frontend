/**
 * App header: Wimaan logo + theme toggle (sun = dark mode, moon = light mode).
 */
import { useTheme } from '../context/ThemeContext';

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--wimaan-border)] bg-[var(--wimaan-bg-card)]">
      <div className="flex items-center gap-2">
        <img src="/wimaan.png" alt="Wimaan" className="h-8 w-auto" />
        <span className="font-semibold text-[var(--wimaan-text)]">Wimaan</span>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-lg text-[var(--wimaan-muted)] hover:bg-[var(--wimaan-border)] hover:text-[var(--wimaan-text)] transition"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  );
}
