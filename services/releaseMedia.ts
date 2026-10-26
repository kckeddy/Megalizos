import { Platform } from 'react-native';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export interface ReleaseTrack { id: string; title: string; audioName: string; audioUri: string; mimeType?: string; size?: number; }
export interface ArtworkMetadata { name?: string; mimeType?: string; size?: number; width: number; height: number; }
export interface ArtworkReport { metadata: ArtworkMetadata | null; errors: string[]; warnings: string[]; valid: boolean; }
export const artworkRules = { minSide: 3000, maxSide: 6000, maxBytes: 20 * 1024 * 1024 };
export const maxTracks = 50;
function uniqueId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
async function keepOnDevice(uri: string, name: string, userId: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  if (!FileSystem.documentDirectory) throw new Error('Device file storage is unavailable.');
  const directory = `${FileSystem.documentDirectory}megalizos/${userId}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const extension = name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'file';
  const destination = `${directory}${uniqueId()}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
export async function chooseAudioTracks(userId: string, multiple = true): Promise<ReleaseTrack[]> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', multiple, copyToCacheDirectory: true });
  if (result.canceled) return [];
  if (result.assets.length > maxTracks) throw new Error(`Select no more than ${maxTracks} tracks at a time.`);
  for (const file of result.assets) {
    if (!/\.(wav|flac|mp3)$/i.test(file.name)) throw new Error(`${file.name}: choose a WAV, FLAC or MP3 audio file.`);
    if (file.size === 0) throw new Error(`${file.name}: this file is empty. Choose another file.`);
  }
  return Promise.all(result.assets.map(async file => ({ id: uniqueId(), title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '), audioName: file.name, audioUri: await keepOnDevice(file.uri, file.name, userId), mimeType: file.mimeType, size: file.size })));
}
export function evaluateArtwork(metadata: ArtworkMetadata): ArtworkReport {
  const errors: string[] = []; const warnings: string[] = [];
  const extension = metadata.name?.split('.').pop()?.toLowerCase();
  const supported = metadata.mimeType === 'image/jpeg' || metadata.mimeType === 'image/png' || (!metadata.mimeType && ['jpg', 'jpeg', 'png'].includes(extension || ''));
  if (!supported) errors.push('Use a JPG or PNG image. Reselect the original file if its format cannot be verified.');
  if (!metadata.width || !metadata.height) errors.push('Image dimensions could not be read. Choose another image.');
  else {
    if (metadata.width !== metadata.height) errors.push(`Artwork must be square. This image is ${metadata.width} × ${metadata.height}; crop it to equal sides.`);
    if (Math.min(metadata.width, metadata.height) < artworkRules.minSide) errors.push('Artwork is too small. Use an original image at least 3000 × 3000 pixels.');
    if (Math.max(metadata.width, metadata.height) > artworkRules.maxSide) errors.push('Artwork is too large. Resize it to no more than 6000 × 6000 pixels.');
  }
  if (metadata.size !== undefined && metadata.size > artworkRules.maxBytes) errors.push('Artwork exceeds 20 MB. Export a smaller JPG or PNG.');
  if (metadata.size === undefined) warnings.push('File size could not be verified. Keep your original artwork under 20 MB.');
  return { metadata, errors, warnings, valid: errors.length === 0 };
}
export async function inspectArtwork(uri: string, details?: Partial<ArtworkMetadata>): Promise<ArtworkReport> {
  if (details?.size !== undefined && details.size > artworkRules.maxBytes) return { metadata: { ...details, width: 0, height: 0 }, errors: ['Artwork exceeds 20 MB. Export a smaller JPG or PNG.'], warnings: [], valid: false };
  try {
    const image = await Image.loadAsync(uri);
    const report = evaluateArtwork({ ...details, width: image.width, height: image.height });
    image.release();
    return report;
  } catch {
    return { metadata: null, errors: ['Unable to read this artwork. Reselect a valid JPG or PNG from your device.'], warnings: [], valid: false };
  }
}
export async function chooseArtwork(userId: string): Promise<{ uri: string; report: ArtworkReport } | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'], copyToCacheDirectory: true });
  if (result.canceled) return null;
  const file = result.assets[0];
  const report = await inspectArtwork(file.uri, { name: file.name, mimeType: file.mimeType, size: file.size });
  const uri = await keepOnDevice(file.uri, file.name, userId);
  return { uri, report };
}
export async function verifyAudioFiles(tracks: ReleaseTrack[]): Promise<void> {
  for (const track of tracks) {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(track.audioUri);
        if (!response.ok) throw new Error('missing');
        await response.body?.cancel();
      } else {
        const info = await FileSystem.getInfoAsync(track.audioUri);
        if (!info.exists) throw new Error('missing');
      }
    } catch { throw new Error(`The audio for “${track.title}” is no longer available. Replace that file before submitting.`); }
  }
}
