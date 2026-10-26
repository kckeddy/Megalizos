import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArtworkMetadata, ReleaseTrack } from '@/services/releaseMedia';
export type { ArtworkMetadata, ReleaseTrack } from '@/services/releaseMedia';

export type ReleaseStatus = 'Live' | 'In review' | 'Draft';
export interface Release {
  id: string; title: string; artist: string; kind: 'Single' | 'EP' | 'Album'; genre: string; date: string; status: ReleaseStatus; streams: number; earnings: number; cover?: string; artwork?: ArtworkMetadata; tracks?: ReleaseTrack[]; audioName?: string; audioUri?: string; stores: string[];
}
export const stores = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal'];
export const sampleReleases: Release[] = [
  { id: 'orbit', title: 'Midnight Orbit', artist: 'Alex Morgan', kind: 'Single', genre: 'Electronic', date: '2026-10-09', status: 'Live', streams: 248630, earnings: 984.52, stores: [...stores] },
  { id: 'afterglow', title: 'Afterglow', artist: 'Alex Morgan', kind: 'EP', genre: 'Alternative', date: '2026-09-18', status: 'Live', streams: 176892, earnings: 701.18, cover: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500&auto=format&fit=crop&q=80', stores: [...stores] },
  { id: 'bluehour', title: 'Blue Hour', artist: 'Alex Morgan', kind: 'Single', genre: 'Electronic', date: '2026-11-06', status: 'In review', streams: 0, earnings: 0, cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80', stores: [...stores] },
];
const legacyKey = 'megalizos.releases.v1';
const accountKey = (userId: string) => `megalizos.releases.v2.${userId}`;
export function getReleaseTracks(release: Release): ReleaseTrack[] {
  if (Array.isArray(release.tracks)) return release.tracks;
  if (release.audioName && release.audioUri) return [{ id: `${release.id}-track-1`, title: release.title, audioName: release.audioName, audioUri: release.audioUri }];
  return [];
}
function parseCatalog(value: string | null): Release[] {
  if (!value) return [];
  const data = JSON.parse(value);
  if (!Array.isArray(data) || data.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || !Array.isArray(item.stores))) throw new Error('The device catalog could not be read. Your original data has not been changed.');
  return data.map((item: Release) => ({ ...item, tracks: getReleaseTracks(item) }));
}
export async function loadReleases(userId: string): Promise<Release[]> { return parseCatalog(await AsyncStorage.getItem(accountKey(userId))); }
export async function saveReleases(userId: string, releases: Release[]) { await AsyncStorage.setItem(accountKey(userId), JSON.stringify(releases)); }
export async function loadLegacyReleases(): Promise<Release[]> { return parseCatalog(await AsyncStorage.getItem(legacyKey)); }
export async function hasLegacyReleases(): Promise<boolean> { return Boolean(await AsyncStorage.getItem(legacyKey)); }
export function getTotals(releases: Release[]) { return releases.reduce((total, release) => ({ streams: total.streams + release.streams, earnings: total.earnings + release.earnings, live: total.live + (release.status === 'Live' ? 1 : 0) }), { streams: 0, earnings: 0, live: 0 }); }
export const weeklyStreams = [35, 52, 42, 67, 58, 85, 73, 64, 92, 79, 87, 100, 82, 96];
export const money = (value: number) => '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
