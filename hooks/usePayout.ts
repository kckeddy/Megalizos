import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/template';
import { PayoutKind, PayoutMethod, clearPayout, loadPayout, payoutKindLabel, savePayout, validatePayout } from '@/services/payouts';

export function usePayout() {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [kind, setKind] = useState<PayoutKind>('bank');
  const [accountName, setAccountName] = useState('');
  const [destination, setDestination] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const mounted = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const token = ++generation.current;
    setMethod(null); setEditing(false); setError(''); setNotice(''); setKind('bank'); setAccountName(''); setDestination('');
    if (!userId) return;
    setLoading(true);
    loadPayout(userId)
      .then(saved => { if (mounted.current && token === generation.current) { setMethod(saved); if (saved) { setKind(saved.kind); setAccountName(saved.accountName); setDestination(saved.destination); } } })
      .catch(reason => { if (mounted.current && token === generation.current) setError(reason instanceof Error ? reason.message : 'Unable to read your payout destination.'); })
      .finally(() => { if (mounted.current && token === generation.current) setLoading(false); });
  }, [userId]);

  const startEditing = useCallback(() => {
    setNotice(''); setError('');
    if (method) { setKind(method.kind); setAccountName(method.accountName); setDestination(method.destination); }
    setEditing(true);
  }, [method]);

  const cancel = useCallback(() => {
    setEditing(false); setError(''); setNotice('');
    if (method) { setKind(method.kind); setAccountName(method.accountName); setDestination(method.destination); }
    else { setKind('bank'); setAccountName(''); setDestination(''); }
  }, [method]);

  const save = useCallback(async () => {
    if (!userId || saving) return;
    setError(''); setNotice('');
    const problem = validatePayout(kind, accountName, destination);
    if (problem) { setError(problem); return; }
    setSaving(true);
    const next: PayoutMethod = { kind, accountName: accountName.trim(), destination: destination.trim(), updatedAt: new Date().toISOString() };
    try {
      await savePayout(userId, next);
      if (!mounted.current) return;
      setMethod(next); setEditing(false); setNotice('Payout destination saved on this device.');
    } catch {
      if (mounted.current) setError('Unable to save your payout destination on this device.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [userId, saving, kind, accountName, destination]);

  const remove = useCallback(async () => {
    if (!userId || saving) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await clearPayout(userId);
      if (!mounted.current) return;
      setMethod(null); setEditing(false); setKind('bank'); setAccountName(''); setDestination('');
      setNotice('Payout destination removed from this device.');
    } catch {
      if (mounted.current) setError('Unable to remove your payout destination.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [userId, saving]);

  return {
    method, methodLabel: method ? payoutKindLabel(method.kind) : '', kind, setKind, accountName, setAccountName, destination, setDestination,
    editing, startEditing, cancel, save, remove, loading, saving, error, notice,
  };
}
