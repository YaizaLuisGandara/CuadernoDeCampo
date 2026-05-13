import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ title: 'Panel Admin', presentation: 'modal' }} />
      <Stack.Screen name="fincas" options={{ title: 'Mis Fincas' }} />
    </Stack>
  );
}