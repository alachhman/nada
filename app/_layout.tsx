import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NadaProvider } from '@/components/providers/NadaProvider';
import { ScrollProvider } from '@/components/providers/ScrollProvider';
import { BreakProvider } from '@/components/providers/BreakProvider';
import { CartProvider } from '@/components/providers/CartProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NadaProvider>
          <ScrollProvider>
            <BreakProvider>
              <CartProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </CartProvider>
            </BreakProvider>
          </ScrollProvider>
        </NadaProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
