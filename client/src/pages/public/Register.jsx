import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Field, Input } from '../../components/FormControls.jsx';
import { registerSchema, zodErrors } from '../../schemas/authSchemas.js';
import { getErrorMessage } from '../../services/api.js';
import { dashboardHome } from '../../utils/roles.js';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      });
      toast.success('Account created. Welcome to CivicConnect!');
      navigate(dashboardHome(user.role), { replace: true });
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
          <h1 className="text-2xl font-bold text-navy-900">Create your account</h1>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6" noValidate>
          <Field label="Full name" htmlFor="name" error={errors.name} required>
            <Input id="name" name="name" value={form.name} onChange={onChange} error={errors.name} placeholder="Jane Doe" />
          </Field>
          <Field label="Email address" htmlFor="email" error={errors.email} required>
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} placeholder="you@example.com" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} placeholder="555-0100" />
            </Field>
            <Field label="Address" htmlFor="address" error={errors.address}>
              <Input id="address" name="address" value={form.address} onChange={onChange} error={errors.address} placeholder="Area / street" />
            </Field>
          </div>
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters with a letter and a number" required>
            <Input id="password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword} required>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
          </Field>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-navy-500">
            Already registered? <Link to="/login" className="link">Sign in</Link>
          </p>
        </form>
      </div>

      <div className="hidden rounded-2xl bg-gradient-to-br from-civic-700 to-navy-900 p-10 text-white lg:block">
        <h2 className="text-2xl font-bold">Your voice, your city</h2>
        <p className="mt-3 max-w-sm text-civic-100">
          Register as a citizen to report potholes, garbage, streetlights, water supply issues and
          more. Every complaint gets a tracking code so you always know what is happening.
        </p>
      </div>
    </div>
  );
}
