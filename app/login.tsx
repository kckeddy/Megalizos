import { useAuth } from '@/template';
import { ArtistAuth } from '@/components/feature/ArtistAuth';
import { Index } from '@/app/index';
export function LoginPage() {
  const { user } = useAuth();
  // AuthRouter in the index route owns post-authentication navigation.
  return user ? <Index /> : <ArtistAuth />;
}
export default LoginPage;
