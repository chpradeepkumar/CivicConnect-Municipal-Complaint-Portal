import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import categoryService from '../../services/categoryService.js';
import CategoryIcon from '../../components/CategoryIcon.jsx';
import { CardsSkeleton } from '../../components/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/EmptyState.jsx';

export default function Categories() {
  const { data, loading, error, reload } = useAsync(() => categoryService.list(), []);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="badge bg-civic-50 text-civic-700">Categories</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy-900">Report by category</h1>
        <p className="mt-5 text-lg text-navy-600">
          Pick the category that best fits your issue so it reaches the right department quickly.
        </p>
      </div>

      <div className="mt-14">
        {loading ? (
          <CardsSkeleton count={6} />
        ) : error ? (
          <ErrorState message="Could not load categories" onRetry={reload} />
        ) : data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((cat) => (
              <div key={cat._id} className="card flex flex-col p-6">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${cat.colorHex}1a`, color: cat.colorHex }}
                >
                  <CategoryIcon name={cat.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{cat.name}</h3>
                <p className="mt-1 flex-1 text-sm text-navy-500">{cat.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
                  <span className="text-xs font-medium text-navy-400">
                    {cat.complaintCount || 0} report{cat.complaintCount === 1 ? '' : 's'}
                  </span>
                  <Link to="/register" className="link flex items-center gap-1 text-sm">
                    Report <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-navy-500">No categories configured yet.</p>
        )}
      </div>
    </div>
  );
}
