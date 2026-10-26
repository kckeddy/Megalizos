import { useContext } from 'react';
import { ReleasesContext } from '@/contexts/ReleasesContext';
export function useReleases() { const context = useContext(ReleasesContext); if (!context) throw new Error('useReleases requires ReleasesProvider'); return context; }
