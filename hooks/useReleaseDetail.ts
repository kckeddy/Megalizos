import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useReleases } from '@/hooks/useReleases';
import { getReleaseTracks, ReleaseTrack } from '@/services/releases';
export type ReleaseDetailEntry = { id: string; type: 'heading'; title: string } | { id: string; type: 'track'; track: ReleaseTrack; position: number } | { id: string; type: 'store'; store: string };
export function useReleaseDetail() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>(); const { releases, ready, removeRelease } = useReleases(); const router = useRouter(); const { showAlert } = useAlert();
  const release = releases.find(item => item.id === id);
  const entries = useMemo<ReleaseDetailEntry[]>(() => {
    if (!release) return [];
    const tracks = getReleaseTracks(release);
    return [
      { id: 'tracklist-heading', type: 'heading', title: `Tracklist · ${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'}` },
      ...tracks.map((track, index): ReleaseDetailEntry => ({ id: `track-${track.id}`, type: 'track', track, position: index + 1 })),
      { id: 'stores-heading', type: 'heading', title: `Selected platforms · ${release.stores.length}` },
      ...release.stores.map((store): ReleaseDetailEntry => ({ id: `store-${store}`, type: 'store', store })),
    ];
  }, [release]);
  const backToReleases = useCallback(() => router.replace('/(tabs)/releases'), [router]);
  const edit = useCallback(() => { if (release) router.push({ pathname: '/upload', params: { editId: release.id } }); }, [release, router]);
  const openInsights = useCallback(() => router.push('/(tabs)/insights'), [router]);
  const deleteRelease = useCallback(() => {
    if (!release) return;
    showAlert('Remove this release?', 'This removes the release from this artist account’s device catalog only. It does not request a store takedown.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => { removeRelease(release.id); router.replace('/(tabs)/releases'); } }]);
  }, [release, showAlert, removeRelease, router]);
  return { release, created, ready, entries, backToReleases, edit, openInsights, deleteRelease };
}
