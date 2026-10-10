import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MapPin, Crosshair } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/FormControls.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { PageLoader } from '../../components/Spinner.jsx';
import useAsync from '../../hooks/useAsync.js';
import categoryService from '../../services/categoryService.js';
import complaintService from '../../services/complaintService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { complaintSchema, zodErrors } from '../../schemas/complaintSchema.js';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: categories, loading } = useAsync(() => categoryService.list(), []);
  const [form, setForm] = useState({
    title: '', description: '', category: '', address: '', priority: 'medium', latitude: '', longitude: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (categories?.length && !form.category) {
      setForm((f) => ({ ...f, category: categories[0]._id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        toast.success('Location captured');
      },
      () => {
        setLocating(false);
        toast.error('Could not access your location');
      }
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = complaintSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      toast.error('Please fix the highlighted fields');
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const complaint = await complaintService.create({ ...form, images: files });
      toast.success(`Complaint submitted. Tracking code: ${complaint.trackingCode}`);
      navigate(`/citizen/complaints/${complaint._id}`);
    } catch (err) {
      const details = err?.response?.data?.details;
      if (Array.isArray(details)) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading categories…" />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Report an issue" subtitle="Provide as much detail as you can so staff can act quickly." />

      <form onSubmit={onSubmit} className="card space-y-5 p-6" noValidate>
        <Field label="Category" htmlFor="category" error={errors.category} required>
          <Select id="category" name="category" value={form.category} onChange={onChange} error={errors.category}>
            <option value="">Select a category…</option>
            {(categories || []).map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Title" htmlFor="title" error={errors.title} required hint="A short summary, e.g. “Pothole on Main Street”">
          <Input id="title" name="title" value={form.title} onChange={onChange} error={errors.title} placeholder="Short summary of the issue" />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description} required>
          <Textarea id="description" name="description" rows={5} value={form.description} onChange={onChange} error={errors.description} placeholder="Describe what the problem is, where it is and how long it has been there." />
        </Field>

        <Field label="Address" htmlFor="address" error={errors.address} required>
          <Input id="address" name="address" value={form.address} onChange={onChange} error={errors.address} placeholder="Street, area or landmark" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" value={form.priority} onChange={onChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Coordinates (optional)" hint="Use your current location to help staff find the exact spot">
            <div className="flex gap-2">
              <button type="button" className="btn-secondary shrink-0" onClick={useMyLocation} disabled={locating}>
                <Crosshair className="h-4 w-4" /> {locating ? 'Locating…' : 'Use my location'}
              </button>
              {form.latitude ? (
                <span className="inline-flex items-center gap-1 text-xs text-navy-500">
                  <MapPin className="h-3.5 w-3.5" /> {form.latitude}, {form.longitude}
                </span>
              ) : null}
            </div>
          </Field>
        </div>

        <Field label="Photos" hint="Attach up to 5 images (JPEG, PNG, WEBP, GIF)">
          <ImageUploader files={files} onChange={setFiles} />
        </Field>

        <div className="flex justify-end gap-2 border-t border-navy-100 pt-5">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Send className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
