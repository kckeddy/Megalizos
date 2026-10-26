import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider, AuthProvider } from '@/template';
import { ArtistProvider } from '@/contexts/ArtistContext';
import { ReleasesProvider } from '@/contexts/ReleasesContext';
import { colors } from '@/constants/theme';
export function RootLayout() {
 return <AlertProvider><SafeAreaProvider><AuthProvider><ArtistProvider><ReleasesProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }}><Stack.Screen name="index" /><Stack.Screen name="(tabs)" /><Stack.Screen name="login" options={{ headerShown: false }} /><Stack.Screen name="account" options={{ headerShown: true, title: 'Artist account', headerBackTitle: 'Back' }} /><Stack.Screen name="upload" options={{ presentation: 'fullScreenModal', headerShown: false }} /><Stack.Screen name="release/[id]" options={{ headerShown: true, title: 'Release details', headerBackTitle: 'Back' }} /></Stack></ReleasesProvider></ArtistProvider></AuthProvider></SafeAreaProvider></AlertProvider>;
}
export default RootLayout;
