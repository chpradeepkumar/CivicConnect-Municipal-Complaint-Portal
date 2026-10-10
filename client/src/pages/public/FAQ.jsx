import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, LifeBuoy } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { FAQS } from '../../config/site.js';

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="container-page py-12">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about reporting and tracking civic issues."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="card overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-start gap-3">
                      <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-civic-600" />
                      <span className="font-semibold text-navy-800">{item.q}</span>
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-navy-50 bg-slate-50/60 px-5 py-4 pl-12">
                      <p className="text-sm leading-relaxed text-navy-600">{item.a}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic-50 text-civic-700">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold text-navy-900">Still need help?</h2>
            <p className="mt-2 text-sm text-navy-500">
              Reach the civic helpdesk for assistance with using the portal or logging a complaint.
            </p>
            <Link to="/contact" className="btn-primary mt-4 w-full">Contact Helpdesk</Link>
            <Link to="/track" className="btn-secondary mt-2 w-full">Track a Complaint</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
