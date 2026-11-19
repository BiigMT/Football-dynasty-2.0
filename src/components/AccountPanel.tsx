import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { syncCareerSaves } from '../engine/cloudStorage';

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => onAuthStateChanged(firebaseAuth, setUser), []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setBusy(true);
    void syncCareerSaves(user.uid).then((result) => {
      if (!cancelled) {
        setMessage(`Sync complete · ${result.uploaded} uploaded · ${result.downloaded} restored · ${result.unchanged} unchanged.`);
      }
    }).catch((error) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : 'Cloud sync failed. Local saves are safe.');
    }).finally(() => {
      if (!cancelled) setBusy(false);
    });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const runAuth = async (mode: 'signin' | 'signup') => {
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      }
      setPassword('');
      setMessage('Signed in. Your career saves are ready to sync.');
    } catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Use a password with at least 6 characters.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
      };
      setMessage(messages[code ?? ''] ?? 'Could not complete sign-in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const runSync = async () => {
    if (!user) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await syncCareerSaves(user.uid);
      setMessage(`Sync complete · ${result.uploaded} uploaded · ${result.downloaded} restored · ${result.unchanged} unchanged.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cloud sync failed. Local saves are safe.');
    } finally {
      setBusy(false);
    }
  };

  const runSignOut = async () => {
    setBusy(true);
    try {
      await signOut(firebaseAuth);
      setMessage('Signed out. This device’s career saves remain available offline.');
    } catch {
      setMessage('Could not sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full max-w-sm rounded-xl border border-[#4777AE]/45 bg-[#10243A]/95 p-4 text-slate-100 shadow-xl">
      {user ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#F6C21C]">Football Dynasty account</p>
            <p className="mt-1 break-all text-sm font-semibold">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">Your saves stay on this device and can sync to your account.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={runSync} className="min-h-10 rounded-lg bg-[#F6C21C] px-4 py-2 text-sm font-bold text-[#0D1B2A] disabled:opacity-50">
              {busy ? 'Please wait…' : 'Sync career saves'}
            </button>
            <button type="button" disabled={busy} onClick={runSignOut} className="min-h-10 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 disabled:opacity-50">
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void runAuth('signin'); }} className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#F6C21C]">Cloud account</p>
            <p className="mt-1 text-sm text-slate-300">Sign in to sync Manager and Player Career saves across devices.</p>
          </div>
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Email
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white outline-none focus:border-[#F6C21C]" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Password
            <input type="password" autoComplete="current-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white outline-none focus:border-[#F6C21C]" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-[#F6C21C] px-4 py-2 text-sm font-bold text-[#0D1B2A] disabled:opacity-50">
              {busy ? 'Please wait…' : 'Sign in'}
            </button>
            <button type="button" disabled={busy || !email.trim() || password.length < 6} onClick={() => void runAuth('signup')} className="min-h-10 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 disabled:opacity-50">
              Create account
            </button>
          </div>
        </form>
      )}
      {message && <p role="status" className="mt-3 text-xs leading-relaxed text-[#F6C21C]">{message}</p>}
    </section>
  );
}
