import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
export function TabLayout() {
 const insets = useSafeAreaInsets();
 return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.subtle, tabBarHideOnKeyboard: true, tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }), paddingTop: 8, paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }), paddingHorizontal: 16 }, tabBarLabelStyle: { fontSize: fonts.small, fontWeight: '500' } }}>
 <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size - 2} /> }} />
 <Tabs.Screen name="releases" options={{ title: 'Releases', tabBarIcon: ({ color, size }) => <Feather name="disc" color={color} size={size - 2} /> }} />
 <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" color={color} size={size - 2} /> }} />
 <Tabs.Screen name="royalties" options={{ title: 'Royalties', tabBarIcon: ({ color, size }) => <Feather name="credit-card" color={color} size={size - 2} /> }} />
 </Tabs>;
}
export default TabLayout;
