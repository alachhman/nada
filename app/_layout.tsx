import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NadaProvider } from '@/components/providers/NadaProvider';
import { CartProvider } from '@/components/providers/CartProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NadaProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </CartProvider>
        </NadaProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
