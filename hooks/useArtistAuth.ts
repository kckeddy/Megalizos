import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/template';
import { validateArtistCredentials } from '@/services/artists';
export function useArtistAuth() {
  const auth = useAuth();
  const [mode, setModeValue] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [cooldown, setCooldown] = useState(0);
  const lock = useRef(false); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (cooldown <= 0) return; const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => clearTimeout(timer); }, [cooldown]);
  const setMode = useCallback((value: 'login' | 'register') => { if (lock.current) return; setModeValue(value); setCodeSent(false); setOtp(''); setPassword(''); setConfirm(''); setError(''); setNotice(''); }, []);
  const changeEmail = useCallback((value: string) => { setEmail(value); setCodeSent(false); setOtp(''); setNotice(''); setError(''); }, []);
  const perform = useCallback(async (resend = false) => {
    if (lock.current || auth.operationLoading || (resend && cooldown > 0)) return;
    const invalid = validateArtistCredentials(email, password, mode === 'register' ? confirm : undefined);
    if (invalid) { setError(invalid); return; }
    if (mode === 'register' && codeSent && !resend && !/^\d{4}$/.test(otp)) { setError('Enter the 4-digit verification code from your email.'); return; }
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'login') {
        const result = await auth.signInWithPassword(email.trim().toLowerCase(), password);
        if (result.error) throw new Error(result.error);
        if (!result.user) throw new Error('Login did not complete. Please try again.');
      } else if (!codeSent || resend) {
        const result = await auth.sendOTP(email.trim().toLowerCase());
        if (result.error) throw new Error(result.error);
        if (mounted.current) { setCodeSent(true); setCooldown(60); setNotice('A 4-digit verification code was sent to your email.'); }
      } else {
        const result = await auth.verifyOTPAndLogin(email.trim().toLowerCase(), otp, { password });
        if (result.error) throw new Error(result.error);
        if (!result.user) throw new Error('Account verification did not complete. Please try again.');
      }
    } catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : 'Unable to complete authentication. Please try again.'); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }, [auth, email, password, confirm, mode, codeSent, otp, cooldown]);
  return { user: auth.user, loading: auth.loading, disabled: busy || auth.operationLoading || auth.loading, mode, setMode, email, setEmail: changeEmail, password, setPassword, confirm, setConfirm, otp, setOtp, codeSent, error, notice, cooldown, submit: () => perform(), resend: () => perform(true) };
}
