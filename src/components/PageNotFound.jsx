/**
 * 404 Page Not Found - shown for invalid routes.
 */
import { Link } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export function PageNotFound() {
  return (
    <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[var(--wimaan-muted)] mb-2">404</h1>
          <p className="text-xl text-[var(--wimaan-text)] mb-6">Page not found</p>
          <Link
            to="/call-center"
            className="inline-block px-6 py-3 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white font-semibold rounded-lg shadow transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
