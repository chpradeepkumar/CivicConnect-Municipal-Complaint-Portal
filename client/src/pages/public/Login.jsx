import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Field, Input } from '../../components/FormControls.jsx';
import { SITE_IMAGES } from '../../config/images.js';
import { loginSchema, zodErrors } from '../../schemas/authSchemas.js';
import { getErrorMessage } from '../../services/api.js';
import { dashboardHome } from '../../utils/roles.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || dashboardHome(user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-700 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-navy-900">Sign in to CivicConnect</h1>
        </div>

        <form onSubmit={onSubmit} className="card space-y-5 p-6" noValidate>
          <Field label="Email address" htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              error={errors.email}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} required>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              placeholder="••••••••"
            />
          </Field>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            <LogIn className="h-4 w-4" />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-navy-500">
            New to CivicConnect?{' '}
            <Link to="/register" className="link">Create an account</Link>
          </p>
        </form>

        <div className="mt-4 rounded-lg border border-navy-100 bg-white p-4 text-xs text-navy-500">
          <p className="font-semibold text-navy-700">Demo accounts (after running the seed script)</p>
          <ul className="mt-1 space-y-0.5">
            <li>Citizen — citizen@civicconnect.local / Passw0rd!</li>
            <li>Staff — staff@civicconnect.local / Passw0rd!</li>
            <li>Admin — admin@civicconnect.local / Passw0rd!</li>
          </ul>
        </div>
      </div>

      <div className="relative hidden overflow-hidden rounded-2xl bg-navy-900 p-10 text-white lg:block">
        <img
          src={SITE_IMAGES.login}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/80 to-navy-900/40" />
        <div className="relative">
        <h2 className="text-2xl font-bold">Report. Track. Resolve.</h2>
        <p className="mt-3 max-w-sm text-navy-200">
          CivicConnect connects citizens with the departments that keep the city running.
          Report an issue in minutes and follow every step until it is resolved.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          {['Submit complaints with photos and location', 'Track real-time status updates', 'Transparent resolution history'].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-civic-600 text-xs">✓</span>
              {t}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}
