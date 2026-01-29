import { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/stores/use-auth-store';

import type { AuthState } from '@repo/shared/features/auth/types/store.type';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const isLoggedIn = useAuthStore((state: AuthState) => state.isLoggedIn);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // 스토어 재수화가 완료될 때까지 대기
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsNavigationReady(true);
    });

    // 이미 재수화가 완료된 경우
    if (useAuthStore.persist.hasHydrated()) {
      setIsNavigationReady(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    // 네비게이션이 준비되지 않았으면 대기
    if (!isNavigationReady) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isLoggedIn && !inAuthGroup) {
      // 인증되지 않은 경우 로그인 화면으로 리다이렉트
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // 인증된 경우 탭 화면으로 리다이렉트
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, router, isNavigationReady]);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
