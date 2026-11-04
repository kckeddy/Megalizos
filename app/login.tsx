import { Redirect } from 'expo-router';
import { useAuth } from '@/template';
import { ArtistAuth } from '@/components/feature/ArtistAuth';
export function LoginPage() {
  const { user, loading } = useAuth();
  // The AuthRouter in the (tabs) layout owns post-authentication navigation.
  if (!loading && user) return <Redirect href="/" />;
  return <ArtistAuth />;
}
export default LoginPage;
