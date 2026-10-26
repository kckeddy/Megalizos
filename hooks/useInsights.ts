import { useMemo, useState } from 'react';
import { useReleases } from '@/hooks/useReleases';
import { getPeriodInsights, Period } from '@/services/insights';
export function useInsights() { const { totals } = useReleases(); const [period, setPeriod] = useState<Period>('7 days'); const insights = useMemo(() => getPeriodInsights(totals.streams, period), [totals.streams, period]); return { period, setPeriod, insights }; }
