import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, useAlert } from '@/template';
import { useArtist } from '@/hooks/useArtist';
import { useReleases } from '@/hooks/useReleases';
export function useArtistAccount() {
  const artist = useArtist(); const auth = useAuth(); const { showAlert } = useAlert(); const router = useRouter(); const library = useReleases();
  const [name, setName] = useState(''); const [bio, setBio] = useState(''); const [saved, setSaved] = useState(false); const [signingOut, setSigningOut] = useState(false);
  useEffect(() => { setName(artist.profile?.artist_name || ''); setBio(artist.profile?.bio || ''); }, [artist.profile]);
  useEffect(() => { setSaved(false); }, [auth.user?.id]);
  const save = useCallback(async () => { setSaved(false); if (await artist.saveProfile(name, bio)) setSaved(true); }, [artist.saveProfile, name, bio]);
  const logout = useCallback(() => {
    showAlert('Sign out of Megalizos?', 'Your account profile is stored in the cloud. Local releases remain on this device under your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', onPress: async () => { setSigningOut(true); try { const { error } = await auth.logout(); if (error) { showAlert('Unable to sign out', error); return; } router.replace('/'); } catch (reason) { showAlert('Unable to sign out', reason instanceof Error ? reason.message : 'Please try again.'); } finally { setSigningOut(false); } } },
    ]);
  }, [auth.logout, showAlert, router]);
  const importLegacy = useCallback(() => showAlert('Import previous device catalog?', 'Copy releases from the earlier local demo into this artist account. Existing releases in this account are kept. The original device catalog is not deleted.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Import', onPress: () => { void library.importLegacy(); } }]), [showAlert, library.importLegacy]);
  return { ...artist, user: auth.user, name, setName: (value: string) => { setName(value); setSaved(false); }, bio, setBio: (value: string) => { setBio(value); setSaved(false); }, saved, save, logout, signingOut, disabled: artist.saving || auth.operationLoading || signingOut, legacyAvailable: library.legacyAvailable, libraryReady: library.ready, importLegacy, storageError: library.storageError };
}
