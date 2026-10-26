import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { stores, Release, getReleaseTracks } from '@/services/releases';
import { ArtworkReport, ReleaseTrack, chooseArtwork, chooseAudioTracks, inspectArtwork, maxTracks, verifyAudioFiles } from '@/services/releaseMedia';
import { useArtist } from '@/hooks/useArtist';
import { useReleases } from '@/hooks/useReleases';
export function useReleaseForm() {
  const { addRelease, ready, releases } = useReleases(); const { user } = useAuth(); const { artistName } = useArtist(); const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>(); const existing = releases.find(item => item.id === editId && item.status === 'Draft');
  const [hydratedId, setHydratedId] = useState(''); const [title, setTitle] = useState(''); const [artist, setArtistValue] = useState(''); const artistTouched = useRef(false);
  const [genre, setGenre] = useState('Electronic'); const [date, setDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [kind, setKind] = useState<Release['kind']>('Single'); const [selectedStores, setSelectedStores] = useState<string[]>([...stores]);
  const [tracks, setTracks] = useState<ReleaseTrack[]>([]); const [cover, setCover] = useState(''); const [artworkReport, setArtworkReport] = useState<ArtworkReport | null>(null);
  const [checkingArtwork, setCheckingArtwork] = useState(false); const [rights, setRights] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const mounted = useRef(true); const operationLock = useRef(false); const artworkRequest = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; ++artworkRequest.current; }; }, []);
  useEffect(() => { if (!existing && !artistTouched.current && artistName) setArtistValue(artistName); }, [artistName, existing]);
  useEffect(() => {
    if (!existing || hydratedId === existing.id) return;
    setTitle(existing.title); setArtistValue(existing.artist); artistTouched.current = true; setGenre(existing.genre); setDate(existing.date); setKind(existing.kind); setSelectedStores(existing.stores); setCover(existing.cover || ''); setTracks(getReleaseTracks(existing)); setHydratedId(existing.id);
    if (existing.cover) {
      const request = ++artworkRequest.current; setCheckingArtwork(true);
      const details = existing.artwork || { name: existing.cover.split('/').pop()?.split('?')[0] };
      void inspectArtwork(existing.cover, details).then(report => { if (mounted.current && request === artworkRequest.current) { setArtworkReport(report); setCheckingArtwork(false); } });
    }
  }, [existing, hydratedId]);
  const setArtist = useCallback((value: string) => { artistTouched.current = true; setArtistValue(value); }, []);
  const chooseAudio = useCallback(async (replaceId?: string) => {
    if (!user || operationLock.current) return;
    operationLock.current = true; setBusy(true); setError('');
    try {
      const files = await chooseAudioTracks(user.id, !replaceId && kind !== 'Single');
      if (!mounted.current || files.length === 0) return;
      if (replaceId) { const file = files[0]; setTracks(current => current.map(track => track.id === replaceId ? { ...file, id: track.id, title: track.title } : track)); }
      else {
        const count = tracks.length + files.length;
        if (kind === 'Single' && count > 1) throw new Error('A single has one track. Replace the existing audio or choose EP / Album to add more tracks.');
        if (count > maxTracks) throw new Error(`A release supports up to ${maxTracks} tracks.`);
        setTracks(current => [...current, ...files]);
      }
    } catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : 'Unable to open the audio picker.'); }
    finally { operationLock.current = false; if (mounted.current) setBusy(false); }
  }, [user, kind, tracks.length]);
  const chooseCover = useCallback(async () => {
    if (!user || operationLock.current) return;
    operationLock.current = true; const request = ++artworkRequest.current; setBusy(true); setCheckingArtwork(true); setError('');
    try { const result = await chooseArtwork(user.id); if (result && mounted.current && request === artworkRequest.current) { setCover(result.uri); setArtworkReport(result.report); } }
    catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : 'Unable to open the artwork picker.'); }
    finally { operationLock.current = false; if (mounted.current) { setBusy(false); setCheckingArtwork(false); } }
  }, [user]);
  const updateTrackTitle = useCallback((id: string, value: string) => setTracks(current => current.map(track => track.id === id ? { ...track, title: value } : track)), []);
  const removeTrack = useCallback((id: string) => setTracks(current => current.filter(track => track.id !== id)), []);
  const moveTrack = useCallback((id: string, direction: -1 | 1) => setTracks(current => {
    const index = current.findIndex(track => track.id === id); const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return current;
    const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next;
  }), []);
  const toggleStore = useCallback((store: string) => setSelectedStores(current => current.includes(store) ? current.filter(item => item !== store) : [...current, store]), []);
  const submit = useCallback(async (draft = false) => {
    if (operationLock.current) return;
    setError('');
    if (!user) { setError('Sign in to save a release to your artist account.'); return; }
    if (!ready) { setError('Your library is loading or unavailable. Retry after it has loaded.'); return; }
    if (editId && !existing) { setError('This draft is no longer available for editing.'); return; }
    if (!title.trim() || !artist.trim()) { setError('Enter a release title and artist name.'); return; }
    const parsedDate = new Date(date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) { setError('Enter a valid release date in YYYY-MM-DD format.'); return; }
    if (tracks.some(track => !track.title.trim())) { setError('Give every selected track a title.'); return; }
    if (!draft) {
      if (tracks.length === 0) { setError('Add at least one audio track.'); return; }
      if (kind === 'Single' && tracks.length !== 1) { setError('A single needs exactly one track. Remove extra tracks or change the release type.'); return; }
      if (kind !== 'Single' && tracks.length < 2) { setError('Add at least two tracks for an EP or album, or change the release type to Single.'); return; }
      if (!cover) { setError('Choose JPG or PNG cover artwork before submitting.'); return; }
      if (checkingArtwork) { setError('Wait for artwork validation to finish.'); return; }
      if (selectedStores.length === 0) { setError('Choose at least one streaming store.'); return; }
      if (!rights) { setError('Confirm that you own the rights to your music and artwork.'); return; }
    }
    operationLock.current = true; setBusy(true);
    try {
      let checked = artworkReport;
      if (!draft) {
        checked = await inspectArtwork(cover, artworkReport?.metadata || undefined);
        if (mounted.current) setArtworkReport(checked);
        if (!checked.valid) throw new Error(checked.errors[0] || 'Choose valid artwork before submitting.');
        await verifyAudioFiles(tracks);
      }
      if (!mounted.current) return;
      const id = existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const orderedTracks = tracks.map(track => ({ ...track, title: track.title.trim() }));
      addRelease({ id, title: title.trim(), artist: artist.trim(), genre: genre.trim(), kind, date, status: draft ? 'Draft' : 'In review', streams: existing?.streams || 0, earnings: existing?.earnings || 0, cover: cover || undefined, artwork: checked?.metadata || undefined, tracks: orderedTracks, audioName: orderedTracks[0]?.audioName, audioUri: orderedTracks[0]?.audioUri, stores: selectedStores });
      router.replace({ pathname: '/release/[id]', params: { id, created: draft ? 'draft' : 'submitted' } });
    } catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : 'Unable to save this release.'); }
    finally { operationLock.current = false; if (mounted.current) setBusy(false); }
  }, [user, ready, editId, existing, title, artist, date, tracks, kind, cover, checkingArtwork, selectedStores, rights, artworkReport, genre, addRelease, router]);
  return { editing: Boolean(editId), title, setTitle, artist, setArtist, genre, setGenre, date, setDate, kind, setKind, selectedStores, toggleStore, tracks, updateTrackTitle, removeTrack, moveTrack, chooseAudio, cover, chooseCover, artworkReport, checkingArtwork, busy, rights, setRights, error, submit };
}
