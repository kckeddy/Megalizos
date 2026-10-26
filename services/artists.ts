import { getSupabaseClient } from '@/template';

export interface ArtistProfile { id: string; email: string; artist_name: string | null; bio: string | null; }
export async function loadArtistProfile(id: string): Promise<ArtistProfile> {
  const { data, error } = await getSupabaseClient().from('user_profiles').select('id,email,artist_name,bio').eq('id', id).single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Your artist profile is unavailable. Please try again.');
  return data as ArtistProfile;
}
export async function saveArtistProfile(id: string, artistName: string, bio: string): Promise<ArtistProfile> {
  const name = artistName.trim();
  if (!name || name.length > 100) throw new Error('Enter an artist name between 1 and 100 characters.');
  if (bio.length > 500) throw new Error('Keep your artist bio under 500 characters.');
  const { data, error } = await getSupabaseClient().from('user_profiles').update({ artist_name: name, bio: bio.trim() }).eq('id', id).select('id,email,artist_name,bio').single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Your artist profile could not be saved.');
  return data as ArtistProfile;
}
export function validateArtistCredentials(email: string, password: string, confirm?: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
  if (password.length < 6) return 'Use a password with at least 6 characters.';
  if (confirm !== undefined && password !== confirm) return 'Your passwords do not match.';
  return '';
}
