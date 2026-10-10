import { Link } from 'react-router-dom';
import { FileText, Search, ClipboardCheck, Wrench, CheckCircle2, BellRing } from 'lucide-react';

const FLOW = [
  { icon: FileText, title: 'Submit a complaint', text: 'Choose a category, describe the issue, add up to five photos and confirm the address.' },
  { icon: Search, title: 'We issue a tracking code', text: 'Every complaint gets a unique public reference like CC-2026-AB12CD.' },
  { icon: ClipboardCheck, title: 'Review & assignment', text: 'Municipal staff review the report and assign it to the right department.' },
  { icon: Wrench, title: 'Work in progress', text: 'The assigned team updates the status and records notes as they work.' },
  { icon: CheckCircle2, title: 'Resolution', text: 'Resolution notes and evidence are recorded and become visible to you.' },
  { icon: BellRing, title: 'Stay informed', text: 'You receive notifications at each stage and can reopen if needed.' },
];

const STATUSES = [
  { name: 'Submitted', desc: 'Received and queued for review.', color: 'bg-civic-500' },
  { name: 'Under Review', desc: 'Being assessed by municipal staff.', color: 'bg-amber-500' },
  { name: 'Assigned', desc: 'Assigned to a department or staff member.', color: 'bg-indigo-500' },
  { name: 'In Progress', desc: 'Work is actively underway.', color: 'bg-blue-500' },
  { name: 'Resolved', desc: 'Fixed and awaiting confirmation.', color: 'bg-green-500' },
  { name: 'Closed', desc: 'Confirmed and completed.', color: 'bg-slate-500' },
];

export default function HowItWorks() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="badge bg-civic-50 text-civic-700">How it works</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy-900">
          From report to resolution, step by step
        </h1>
        <p className="mt-5 text-lg text-navy-600">
          CivicConnect makes the whole journey visible so you always know what is happening with
          your complaint.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FLOW.map((step, idx) => (
          <div key={step.title} className="card relative p-6">
            <span className="absolute right-5 top-5 text-3xl font-black text-navy-50">{idx + 1}</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-civic-700 text-white">
              <step.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-semibold text-navy-900">{step.title}</h3>
            <p className="mt-1 text-sm text-navy-500">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-navy-100 bg-white p-8">
        <h2 className="text-2xl font-bold text-navy-900">Complaint statuses explained</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATUSES.map((s) => (
            <div key={s.name} className="flex items-start gap-3 rounded-lg border border-navy-100 p-4">
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${s.color}`} />
              <div>
                <p className="font-semibold text-navy-800">{s.name}</p>
                <p className="text-sm text-navy-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn-primary">Report an Issue</Link>
        <Link to="/track" className="btn-secondary">Track a Complaint</Link>
      </div>
    </div>
  );
}
