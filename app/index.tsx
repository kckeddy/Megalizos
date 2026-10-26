import { Redirect } from 'expo-router';
import { AuthRouter } from '@/template';
export function Index() { return <AuthRouter loginRoute="/login"><Redirect href="/(tabs)" /></AuthRouter>; }
export default Index;
