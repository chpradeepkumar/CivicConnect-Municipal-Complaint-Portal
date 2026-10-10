import { Link } from 'react-router-dom';
import { Target, Users, Eye, Server, ShieldCheck, Smartphone } from 'lucide-react';

const VALUES = [
  { icon: Eye, title: 'Transparency', text: 'Public tracking timelines show progress at every stage.' },
  { icon: Users, title: 'Accountability', text: 'Assignments and status changes are logged and auditable.' },
  { icon: Smartphone, title: 'Accessibility', text: 'A responsive portal that works on phones, tablets and desktops.' },
  { icon: ShieldCheck, title: 'Security first', text: 'Hashed passwords, secure cookies and strict role-based access.' },
];

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="badge bg-civic-50 text-civic-700">About CivicConnect</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy-900">
          A clearer way for citizens and cities to work together
        </h1>
        <p className="mt-5 text-lg text-navy-600">
          CivicConnect is a municipal complaint portal that lets citizens report civic issues,
          upload evidence and follow their resolution. It gives municipal staff and administrators
          the dashboards they need to route work and stay accountable.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="card p-8">
          <Target className="h-8 w-8 text-civic-700" />
          <h2 className="mt-4 text-xl font-bold text-navy-900">Our mission</h2>
          <p className="mt-2 text-navy-600">
            Give every citizen a simple, trustworthy channel to improve their neighbourhood — and
            give municipalities the visibility to act on it efficiently.
          </p>
        </div>
        <div className="card p-8">
          <Server className="h-8 w-8 text-civic-700" />
          <h2 className="mt-4 text-xl font-bold text-navy-900">Built with a modern stack</h2>
          <p className="mt-2 text-navy-600">
            React and Tailwind on the frontend, Node, Express and MongoDB on the backend, secured
            with JWT cookies, validation, rate limiting and audit logging.
          </p>
        </div>
      </div>

      <h2 className="mt-16 text-center text-2xl font-bold text-navy-900">What we value</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic-50 text-civic-700">
              <v.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-semibold text-navy-900">{v.title}</h3>
            <p className="mt-1 text-sm text-navy-500">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-navy-900 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">Have something to report?</h2>
        <p className="mx-auto mt-2 max-w-lg text-navy-200">
          Join CivicConnect and help make your city work better — one report at a time.
        </p>
        <Link to="/register" className="btn-primary mt-6 bg-civic-600 hover:bg-civic-500">
          Create an account
        </Link>
      </div>
    </div>
  );
}
