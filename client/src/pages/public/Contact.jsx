import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, User, Siren } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Field, Input, Textarea } from '../../components/FormControls.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { SITE, HELPLINES } from '../../config/site.js';

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.subject.trim()) next.subject = 'Please add a subject';
    if (form.message.trim().length < 10) next.message = 'Please add at least 10 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success('Thank you. Your message has been recorded and will be reviewed by the helpdesk.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container-page py-12">
      <PageHeader
        title="Contact the Corporation"
        subtitle="Grievance helpdesk, emergency numbers and office details."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact details */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy-900">
              <MapPin className="h-4 w-4 text-civic-600" /> Office
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-navy-400">Address</dt>
                <dd className="font-medium text-navy-800">{SITE.address}</dd>
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="link mt-1 inline-block text-xs">
                  Open in Google Maps
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Phone</dt>
                  <dd className="font-medium text-navy-800">
                    <a href={`tel:${SITE.helpline}`} className="hover:underline">{SITE.helpline}</a>
                    <span className="text-navy-400"> ({SITE.helplineLabel})</span>
                    <br />
                    <a href={`tel:${SITE.controlRoom}`} className="hover:underline">{SITE.controlRoom}</a>
                    <span className="text-navy-400"> (Control Room)</span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Email</dt>
                  <dd className="font-medium text-navy-800">
                    <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
                    <br />
                    <a href={`mailto:${SITE.grievanceEmail}`} className="hover:underline">{SITE.grievanceEmail}</a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Working hours</dt>
                  <dd className="font-medium text-navy-800">{SITE.officeHours}</dd>
                </div>
              </div>
              <div className="border-t border-navy-50 pt-4">
                <dt className="text-navy-400">Grievance Officer</dt>
                <dd className="font-medium text-navy-800">{SITE.grievanceOfficer}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy-900">
              <Siren className="h-4 w-4 text-red-600" /> Emergency & service helplines
            </h2>
            <ul className="mt-4 divide-y divide-navy-50">
              {HELPLINES.map((h) => (
                <li key={h.number + h.service} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-navy-600">{h.service}</span>
                  <span className="text-right">
                    <a href={`tel:${h.number}`} className="font-semibold text-navy-900 hover:underline">{h.number}</a>
                    <span className="block text-xs text-navy-400">{h.hours}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Message form */}
        <div>
          <form onSubmit={onSubmit} className="card space-y-4 p-6" noValidate>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-civic-600" />
              <h2 className="font-semibold text-navy-900">Send a message to the helpdesk</h2>
            </div>
            <Field label="Your name" error={errors.name} required>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            </Field>
            <Field label="Email" error={errors.email} required>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            </Field>
            <Field label="Subject" error={errors.subject} required>
              <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} error={errors.subject} />
            </Field>
            <Field label="Message" error={errors.message} required>
              <Textarea rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} error={errors.message} />
            </Field>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                <Send className="h-4 w-4" /> Send message
              </button>
            </div>
            <p className="text-xs text-navy-400">
              For a tracked, actionable complaint please use{' '}
              <a href="/register" className="link">Report an Issue</a> instead so it is routed to the correct department.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
