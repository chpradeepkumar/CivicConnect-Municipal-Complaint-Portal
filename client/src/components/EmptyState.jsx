import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-navy-200 bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-navy-800">{title}</h3>
      {message ? <p className="max-w-md text-sm text-navy-500">{message}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
