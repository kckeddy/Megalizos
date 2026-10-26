import { createContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/template';
import { ArtistProfile, loadArtistProfile, saveArtistProfile } from '@/services/artists';
interface ArtistState { profile: ArtistProfile | null; artistName: string; loading: boolean; saving: boolean; error: string; reload: () => void; saveProfile: (name: string, bio: string) => Promise<boolean>; }
export const ArtistContext = createContext<ArtistState | undefined>(undefined);
export function ArtistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const userId = user?.id || '';
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  const generation = useRef(0); const saveLock = useRef(false);
  useEffect(() => {
    const token = ++generation.current; let active = true;
    setProfile(null); setError(''); setSaving(false); saveLock.current = false;
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    loadArtistProfile(userId).then(data => { if (active && token === generation.current) setProfile(data); }).catch(reason => { if (active && token === generation.current) setError(reason instanceof Error ? reason.message : 'Unable to load artist profile.'); }).finally(() => { if (active && token === generation.current) setLoading(false); });
    return () => { active = false; };
  }, [userId, revision]);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  const saveProfile = useCallback(async (name: string, bio: string) => {
    if (!userId || saveLock.current) return false;
    saveLock.current = true; const token = generation.current; setSaving(true); setError('');
    try { const data = await saveArtistProfile(userId, name, bio); if (token !== generation.current) return false; setProfile(data); return true; }
    catch (reason) { if (token === generation.current) setError(reason instanceof Error ? reason.message : 'Unable to save artist profile.'); return false; }
    finally { if (token === generation.current) { saveLock.current = false; setSaving(false); } }
  }, [userId]);
  const visibleProfile = profile?.id === userId ? profile : null;
  const artistName = visibleProfile?.artist_name || '';
  const value = useMemo(() => ({ profile: visibleProfile, artistName, loading, saving, error, reload, saveProfile }), [visibleProfile, artistName, loading, saving, error, reload, saveProfile]);
  return <ArtistContext.Provider value={value}>{children}</ArtistContext.Provider>;
}
