import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/template';
import { PlanId, getPlanById, getPricingProfile } from '@/services/pricing';
import { defaultPlanId, loadPlan, savePlan } from '@/services/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [planId, setPlanId] = useState<PlanId>(defaultPlanId);
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
    setError(''); setNotice('');
    if (!userId) { setPlanId(defaultPlanId); return; }
    setLoading(true);
    loadPlan(userId)
      .then(saved => { if (mounted.current && token === generation.current) setPlanId(saved); })
      .catch(() => { if (mounted.current && token === generation.current) setError('Unable to read your saved plan. Starter is shown until it can be loaded.'); })
      .finally(() => { if (mounted.current && token === generation.current) setLoading(false); });
  }, [userId]);

  const selectPlan = useCallback(async (next: PlanId) => {
    if (!userId || saving) return;
    const previous = planId;
    setPlanId(next); setError(''); setNotice('');
    if (next === previous) return;
    setSaving(true);
    try {
      await savePlan(userId, next);
      if (mounted.current) setNotice(`${getPlanById(next)?.name || 'Plan'} selected. Billing is not connected in this demo.`);
    } catch {
      if (!mounted.current) return;
      setPlanId(previous);
      setError('Unable to save your plan selection on this device.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [userId, saving, planId]);

  return { planId, selectPlan, loading, saving, error, notice, profile: getPricingProfile() };
}
