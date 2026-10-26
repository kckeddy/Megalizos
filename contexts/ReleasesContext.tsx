import { createContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/template';
import { Release, getTotals, hasLegacyReleases, loadLegacyReleases, loadReleases, saveReleases } from '@/services/releases';
interface ReleasesState { releases: Release[]; ready: boolean; storageError: string; totals: ReturnType<typeof getTotals>; legacyAvailable: boolean; importLegacy: () => Promise<void>; reloadLibrary: () => void; addRelease: (release: Release) => void; removeRelease: (id: string) => void; }
export const ReleasesContext = createContext<ReleasesState | undefined>(undefined);
export function ReleasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const userId = user?.id || '';
  const [releases, setReleases] = useState<Release[]>([]); const [ownerId, setOwnerId] = useState('');
  const [ready, setReady] = useState(false); const [storageError, setStorageError] = useState(''); const [legacyAvailable, setLegacyAvailable] = useState(false); const [revision, setRevision] = useState(0);
  const saveQueue = useRef(Promise.resolve()); const generation = useRef(0);
  useEffect(() => {
    let mounted = true; const token = ++generation.current;
    setReleases([]); setOwnerId(''); setReady(false); setStorageError(''); setLegacyAvailable(false);
    if (!userId) return;
    saveQueue.current.then(() => loadReleases(userId)).then(data => { if (mounted && token === generation.current) { setReleases(data); setOwnerId(userId); setReady(true); } }).catch(reason => { if (mounted) setStorageError(reason instanceof Error ? reason.message : 'Unable to load your device catalog. Please retry.'); });
    hasLegacyReleases().then(value => { if (mounted) setLegacyAvailable(value); }).catch(() => {});
    return () => { mounted = false; };
  }, [userId, revision]);
  useEffect(() => {
    if (!ready || !userId || ownerId !== userId) return;
    let active = true; const token = generation.current;
    saveQueue.current = saveQueue.current.then(() => saveReleases(userId, releases)).then(() => { if (active && token === generation.current) setStorageError(''); }).catch(() => { if (active && token === generation.current) setStorageError('Changes are available this session, but could not be saved to this device.'); });
    return () => { active = false; };
  }, [releases, ready, userId, ownerId]);
  const addRelease = useCallback((release: Release) => { if (ready && ownerId === userId && userId) setReleases(current => [release, ...current.filter(item => item.id !== release.id)]); }, [ready, ownerId, userId]);
  const removeRelease = useCallback((id: string) => { if (ready && ownerId === userId && userId) setReleases(current => current.filter(item => item.id !== id)); }, [ready, ownerId, userId]);
  const reloadLibrary = useCallback(() => {
    if (!userId) return;
    if (!ready || ownerId !== userId) { setRevision(value => value + 1); return; }
    const token = generation.current;
    // Retry saving the current in-memory catalog without discarding unsaved changes.
    saveQueue.current = saveQueue.current.then(() => saveReleases(userId, releases)).then(() => { if (token === generation.current) setStorageError(''); }).catch(() => { if (token === generation.current) setStorageError('Changes are still available this session, but device storage remains unavailable.'); });
  }, [userId, ready, ownerId, releases]);
  const importLegacy = useCallback(async () => {
    if (!userId || !ready || ownerId !== userId) return;
    const token = generation.current;
    try { const data = await loadLegacyReleases(); if (token !== generation.current) return; setReleases(current => [...current, ...data.filter(item => !current.some(existing => existing.id === item.id))]); setLegacyAvailable(false); }
    catch (reason) { if (token === generation.current) setStorageError(reason instanceof Error ? reason.message : 'Unable to import the previous device catalog.'); }
  }, [userId, ready, ownerId]);
  const visibleReleases = useMemo(() => userId && ownerId === userId ? releases : [], [userId, ownerId, releases]);
  const totals = useMemo(() => getTotals(visibleReleases), [visibleReleases]);
  const value = useMemo(() => ({ releases: visibleReleases, ready: Boolean(userId && ownerId === userId && ready), storageError, totals, addRelease, removeRelease, legacyAvailable, importLegacy, reloadLibrary }), [visibleReleases, userId, ownerId, ready, storageError, totals, addRelease, removeRelease, legacyAvailable, importLegacy, reloadLibrary]);
  return <ReleasesContext.Provider value={value}>{children}</ReleasesContext.Provider>;
}
