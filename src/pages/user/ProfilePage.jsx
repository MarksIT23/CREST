import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Alumni'];

function InputField({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // ── Profile form ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name:      user?.name      || '',
    studentId: user?.studentId || '',
    year:      user?.year      || '',
    section:   user?.section   || '',
    bio:       user?.bio       || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setProfileSaved(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateProfile(form);
    setProfileSaved(true);
    setProfileSaving(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // ── Change Password form ──────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const setPwField = (key, value) => {
    setPw((p) => ({ ...p, [key]: value }));
    setPwError('');
    setPwSuccess('');
  };

  const validatePw = () => {
    if (!pw.current) return 'Please enter your current password.';
    if (!pw.next)    return 'Please enter a new password.';
    if (pw.next.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(pw.next)) return 'New password must contain at least one letter.';
    if (pw.next !== pw.confirm) return 'Passwords do not match.';
    return null;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const err = validatePw();
    if (err) { setPwError(err); return; }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: pw.next,
      });
      if (error) {
        setPwError(error.message || 'Failed to change password.');
      } else {
        setPwSuccess('Password changed successfully!');
        setPw({ current: '', next: '', confirm: '' });
      }
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────
  const inputCls =
    'w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  const passwordStrength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)            score++;
    if (p.length >= 12)           score++;
    if (/[A-Z]/.test(p))          score++;
    if (/[0-9]/.test(p))          score++;
    if (/[^A-Za-z0-9]/.test(p))   score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/4' };
    if (score <= 2) return { label: 'Fair',   color: 'bg-amber-500',  width: 'w-2/4' };
    if (score <= 3) return { label: 'Good',   color: 'bg-yellow-400', width: 'w-3/4' };
    return             { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = passwordStrength(pw.next);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[640px] mx-auto px-4 md:px-12 py-12 space-y-8"
    >
      <div className="mb-2">
        <h1 className="font-display text-[28px] md:text-[36px] font-bold mb-2 text-neutral-900">My Profile</h1>
        <p className="text-neutral-500 text-[15px]">Manage your account details and security settings.</p>
      </div>

      {/* ── Profile Info Card ── */}
      <form onSubmit={handleProfileSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-5">
        {/* Avatar + email header */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-display font-bold text-[22px]">
            {form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-bold text-[16px] text-neutral-900">{user?.email}</div>
            <div className="text-[13px] text-neutral-500 capitalize">{user?.role}</div>
            {user?.program && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                {user.program}
              </span>
            )}
          </div>
        </div>

        <InputField label="Full Name">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </InputField>

        {user?.role === 'student' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1">
                <InputField label="Student ID">
                  <input value={form.studentId} onChange={(e) => set('studentId', e.target.value)} placeholder="BSIT-2022-000" className={inputCls} />
                </InputField>
              </div>
              <InputField label="Year">
                <select value={form.year} onChange={(e) => set('year', e.target.value)} className={inputCls}>
                  <option value="">Select year...</option>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </InputField>
              <InputField label="Section">
                <input value={form.section} onChange={(e) => set('section', e.target.value)} placeholder="BSIT-4A" className={inputCls} />
              </InputField>
            </div>
          </>
        )}

        <InputField label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            rows={4}
            placeholder="Tell the repository community about yourself..."
            className={inputCls}
          />
        </InputField>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={profileSaving}
            className="bg-neutral-900 text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {profileSaved && (
            <span className="text-emerald-600 text-[13px] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Profile updated
            </span>
          )}
        </div>
      </form>

      {/* ── Change Password Card ── */}
      <form onSubmit={handlePwSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-5">
        <div className="flex items-center gap-3 pb-5 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">lock_reset</span>
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold text-neutral-900">Change Password</h2>
            <p className="text-[13px] text-neutral-500">Use a strong password you don't use elsewhere.</p>
          </div>
        </div>

        {/* Current password */}
        <InputField label="Current Password">
          <div className="relative">
            <input
              type={showPw.current ? 'text' : 'password'}
              value={pw.current}
              onChange={(e) => setPwField('current', e.target.value)}
              placeholder="Your current password"
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPw.current ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </InputField>

        {/* New password */}
        <InputField label="New Password">
          <div className="relative">
            <input
              type={showPw.next ? 'text' : 'password'}
              value={pw.next}
              onChange={(e) => setPwField('next', e.target.value)}
              placeholder="At least 8 characters"
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPw.next ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {/* Strength meter */}
          {pw.next && strength && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
              </div>
              <p className={`text-[11px] font-bold ${
                strength.label === 'Weak' ? 'text-red-500' :
                strength.label === 'Fair' ? 'text-amber-500' :
                strength.label === 'Good' ? 'text-yellow-600' : 'text-emerald-600'
              }`}>{strength.label} password</p>
            </div>
          )}
        </InputField>

        {/* Confirm password */}
        <InputField label="Confirm New Password">
          <div className="relative">
            <input
              type={showPw.confirm ? 'text' : 'password'}
              value={pw.confirm}
              onChange={(e) => setPwField('confirm', e.target.value)}
              placeholder="Re-enter new password"
              className={`${inputCls} pr-12 ${
                pw.confirm && pw.next !== pw.confirm ? 'border-red-400 focus:border-red-500 focus:ring-red-200' :
                pw.confirm && pw.next === pw.confirm ? 'border-emerald-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPw.confirm ? 'visibility_off' : 'visibility'}
              </span>
            </button>
            {pw.confirm && (
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${
                pw.next === pw.confirm ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {pw.next === pw.confirm ? 'check_circle' : 'cancel'}
              </span>
            )}
          </div>
          {pw.confirm && pw.next !== pw.confirm && (
            <p className="text-[12px] text-red-500 mt-1">Passwords do not match.</p>
          )}
        </InputField>

        {/* Error / Success */}
        {pwError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-[13px] font-medium">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {pwSuccess}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-amber-500 text-white px-8 py-3 rounded-full text-[14px] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
