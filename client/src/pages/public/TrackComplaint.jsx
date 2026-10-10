import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import complaintService from '../../services/complaintService.js';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge.jsx';
import { Timeline } from '../../components/Timeline.jsx';
import { Input } from '../../components/FormControls.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { getErrorMessage } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatters.js';

export default function TrackComplaint() {
  const { trackingCode } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(trackingCode || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (value) => {
    if (!value?.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const result = await complaintService.track(value.trim());
      setComplaint(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingCode) lookup(trackingCode);
  }, [trackingCode]);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/track/${encodeURIComponent(code.trim())}`);
    lookup(code);
  };

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge bg-civic-50 text-civic-700">Public tracking</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy-900">Track your complaint</h1>
        <p className="mt-4 text-navy-600">
          Enter the tracking code you received when you submitted your complaint.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. CC-2026-AB12CD"
          aria-label="Tracking code"
        />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          Track
        </button>
      </form>

      {error ? (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {complaint ? (
        <div className="mx-auto mt-10 max-w-3xl space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  {complaint.trackingCode}
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy-900">{complaint.title}</h2>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            <p className="mt-4 text-sm text-navy-600">{complaint.description}</p>
            <dl className="mt-6 grid gap-4 border-t border-navy-100 pt-5 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <MapPin className="h-4 w-4 text-civic-600" /> {complaint.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <Clock className="h-4 w-4 text-civic-600" /> Submitted {formatDateTime(complaint.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <CheckCircle2 className="h-4 w-4 text-civic-600" />
                {complaint.category?.name}
              </div>
            </dl>
            {complaint.resolutionNotes ? (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-800">Resolution notes</p>
                <p className="mt-1 text-sm text-green-700">{complaint.resolutionNotes}</p>
              </div>
            ) : null}
          </div>

          <div className="card p-6">
            <h3 className="mb-5 text-lg font-semibold text-navy-900">Progress timeline</h3>
            <Timeline history={complaint.history || []} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
