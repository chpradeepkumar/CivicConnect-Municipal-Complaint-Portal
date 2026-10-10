import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl font-black text-civic-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-md text-navy-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary"><Home className="h-4 w-4" /> Go home</Link>
        <Link to="/track" className="btn-secondary"><Search className="h-4 w-4" /> Track a complaint</Link>
      </div>
    </div>
  );
}
