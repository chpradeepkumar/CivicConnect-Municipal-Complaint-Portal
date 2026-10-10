import { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import userService from '../services/userService.js';
import { getErrorMessage } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Field, Input } from '../components/FormControls.jsx';
import { profileSchema, passwordSchema, zodErrors } from '../schemas/authSchemas.js';
import { ROLE_LABELS } from '../utils/roles.js';
import { formatDateTime } from '../utils/formatters.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) return setProfileErrors(zodErrors(parsed.error));
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile(profile);
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pw);
    if (!parsed.success) return setPwErrors(zodErrors(parsed.error));
    setPwErrors({});
    setSavingPw(true);
    try {
      await userService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" subtitle="Manage your account details and password." />

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-civic-100 text-xl font-bold text-civic-800">
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-navy-900">{user.name}</p>
            <p className="text-sm text-navy-500">{user.email}</p>
            <span className="badge mt-1 bg-civic-50 text-civic-700">{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        {user.lastLoginAt ? (
          <p className="mt-4 text-xs text-navy-400">Last login: {formatDateTime(user.lastLoginAt)}</p>
        ) : null}
      </div>

      <form onSubmit={saveProfile} className="card mb-6 space-y-4 p-6">
        <h2 className="font-semibold text-navy-900">Account details</h2>
        <Field label="Full name" error={profileErrors.name} required>
          <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} error={profileErrors.name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={profileErrors.phone}>
            <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} error={profileErrors.phone} />
          </Field>
          <Field label="Address" error={profileErrors.address}>
            <Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} error={profileErrors.address} />
          </Field>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={savingProfile}>
            <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy-900"><KeyRound className="h-4 w-4" /> Change password</h2>
        <Field label="Current password" error={pwErrors.currentPassword} required>
          <Input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} error={pwErrors.currentPassword} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" error={pwErrors.newPassword} required>
            <Input type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} error={pwErrors.newPassword} />
          </Field>
          <Field label="Confirm new password" error={pwErrors.confirmPassword} required>
            <Input type="password" value={pw.confirmPassword} onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} error={pwErrors.confirmPassword} />
          </Field>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={savingPw}>
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}
