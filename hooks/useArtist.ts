import { useContext } from 'react';
import { ArtistContext } from '@/contexts/ArtistContext';
export function useArtist() {
  const context = useContext(ArtistContext);
  if (!context) throw new Error('useArtist requires ArtistProvider');
  return context;
}
