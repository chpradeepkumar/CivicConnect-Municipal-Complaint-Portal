import { Link } from 'react-router-dom';
import {
  ArrowRight, ClipboardCheck, MapPin, Search, ShieldCheck, FileText,
  CheckCircle2, TrendingUp, Users, Phone, Megaphone, HelpCircle, Siren,
} from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import dashboardService from '../../services/dashboardService.js';
import categoryService from '../../services/categoryService.js';
import CategoryIcon from '../../components/CategoryIcon.jsx';
import NoticeTicker from '../../components/NoticeTicker.jsx';
import { CardsSkeleton, SkeletonLine } from '../../components/LoadingSkeleton.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { SITE, HELPLINES, DISCLAIMER } from '../../config/site.js';

const STEPS = [
  { icon: FileText, title: '1. Report', text: 'Describe the issue, add a photo and confirm the location.' },
  { icon: ClipboardCheck, title: '2. Review', text: 'The Corporation reviews and assigns it to the right department.' },
  { icon: TrendingUp, title: '3. Track', text: 'Follow status updates from submitted to resolved.' },
  { icon: CheckCircle2, title: '4. Resolved', text: 'Get notified with the resolution notes and evidence.' },
];

export default function Home() {
  const { t, lang } = useUi();
  const stats = useAsync(() => dashboardService.publicStats(), []);
  const categories = useAsync(() => categoryService.list(), []);

  return (
    <div>
      <NoticeTicker />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#2557eb_0%,transparent_45%),radial-gradient(circle_at_80%_0%,#ff9933_0%,transparent_40%)]" />
        <div className="container-page relative grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron-500/40 bg-saffron-500/10 px-3 py-1 text-xs font-semibold text-saffron-200">
              <ShieldCheck className="h-3.5 w-3.5" /> {SITE.stateName}
            </span>
            <h1 className="mt-6 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-200">{t('hero.subtitle')}</p>
            <p className="mt-2 max-w-xl text-sm text-navy-300">{SITE.corpNameHi} · {SITE.city}, {SITE.state}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary bg-civic-600 hover:bg-civic-500">
                {t('hero.report')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/track" className="btn border border-navy-700 bg-navy-900/50 text-white hover:bg-navy-800">
                <Search className="h-4 w-4" /> {t('hero.track')}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-300">
              <a href={`tel:${SITE.helpline}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 text-saffron-400" />
                <span className="font-semibold text-saffron-300">{SITE.helpline}</span>
                <span className="text-navy-400">({SITE.helplineLabel})</span>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-navy-800 bg-navy-900/70 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-200">Live grievance statistics</p>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> Live
                </span>
              </div>
              {stats.loading ? (
                <div className="mt-5 space-y-4">
                  {[0, 1, 2, 3].map((i) => <SkeletonLine key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Complaints logged', value: stats.data?.total ?? 0, icon: FileText },
                    { label: 'Resolved', value: stats.data?.resolved ?? 0, icon: CheckCircle2 },
                    { label: 'In progress', value: stats.data?.inProgress ?? 0, icon: TrendingUp },
                    { label: 'Resolution rate', value: `${stats.data?.resolutionRate ?? 0}%`, icon: ShieldCheck },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-navy-800 bg-navy-950/60 p-4">
                      <s.icon className="h-5 w-5 text-civic-400" />
                      <p className="mt-2 text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-navy-300">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="border-b border-navy-100 bg-white">
        <div className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/register', icon: FileText, title: lang === 'hi' ? 'शिकायत दर्ज करें' : 'Lodge a complaint', text: 'Submit a new civic issue with photos.' },
            { to: '/track', icon: Search, title: lang === 'hi' ? 'शिकायत ट्रैक करें' : 'Track status', text: 'Check any complaint using its code.' },
            { to: '/notices', icon: Megaphone, title: lang === 'hi' ? 'सूचनाएँ' : 'Public notices', text: 'Advisories and service updates.' },
            { to: '/contact', icon: HelpCircle, title: lang === 'hi' ? 'सहायता' : 'Get help', text: 'Helplines and helpdesk contacts.' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-civic-50 text-civic-700">
                <a.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-navy-900">{a.title}</span>
                <span className="mt-0.5 block text-sm text-navy-500">{a.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900">What can you report?</h2>
            <p className="mt-2 max-w-xl text-navy-500">
              From roads to drainage, choose the category that fits your issue.
            </p>
          </div>
          <Link to="/categories" className="link">View all categories <ArrowRight className="inline h-4 w-4" /></Link>
        </div>

        <div className="mt-10">
          {categories.loading ? (
            <CardsSkeleton count={6} />
          ) : categories.data?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.data.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  to="/register"
                  className="card group flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${cat.colorHex}1a`, color: cat.colorHex }}
                  >
                    <CategoryIcon name={cat.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-navy-900">{cat.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-navy-500">{cat.description}</p>
                  <span className="mt-3 text-xs font-medium text-navy-400">
                    {cat.complaintCount || 0} report{cat.complaintCount === 1 ? '' : 's'} logged
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-500">Categories will appear here once configured.</p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-navy-100 bg-white py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900">How the grievance process works</h2>
            <p className="mt-3 text-navy-500">A clear, accountable path from report to resolution.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.title} className="relative rounded-xl border border-navy-100 bg-slate-50 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-civic-700 text-white">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-1 text-sm text-navy-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="container-page py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900">
              Built for transparency and accountability
            </h2>
            <p className="mt-4 text-navy-600">
              Every status change records who made it, when, and why. Citizens see a public tracking
              timeline, while staff and administrators get the tools to keep complaints moving.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: MapPin, title: 'Location-aware reports', text: 'Attach an address and optional coordinates.' },
                { icon: ShieldCheck, title: 'Role-based access', text: 'Citizens, staff and admins each see only what they should.' },
                { icon: Users, title: 'Full audit trail', text: 'Assignments and status updates are logged end to end.' },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-civic-50 text-civic-700">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy-900">{item.title}</h3>
                    <p className="text-sm text-navy-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-card">
            <h3 className="font-display text-lg font-semibold text-navy-900">Ready to report an issue?</h3>
            <p className="mt-2 text-sm text-navy-500">
              Create a free citizen account, submit your complaint and track it to completion.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">Get started</Link>
              <Link to="/how-it-works" className="btn-secondary">Learn more</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-navy-100 pt-6 text-center">
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.data?.total ?? '—'}</p>
                <p className="text-xs text-navy-400">Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.data?.resolved ?? '—'}</p>
                <p className="text-xs text-navy-400">Resolved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.data ? `${stats.data.resolutionRate}%` : '—'}</p>
                <p className="text-xs text-navy-400">Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Helplines */}
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-page">
          <div className="flex items-center gap-3">
            <Siren className="h-5 w-5 text-saffron-400" />
            <h2 className="font-display text-2xl font-bold">Emergency & service helplines</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELPLINES.slice(0, 6).map((h) => (
              <a
                key={h.number + h.service}
                href={`tel:${h.number}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-navy-800 bg-navy-900/60 p-4 transition hover:border-saffron-500/50 hover:bg-navy-900"
              >
                <span>
                  <span className="block text-sm text-navy-300">{h.service}</span>
                  <span className="block text-xs text-navy-500">{h.hours}</span>
                </span>
                <span className="text-lg font-bold text-saffron-300">{h.number}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container-page py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Disclaimer</p>
          <p className="mt-1 leading-relaxed">{DISCLAIMER}</p>
        </div>
      </section>
    </div>
  );
}
