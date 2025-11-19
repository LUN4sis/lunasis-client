import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // TODO: OAuth 콜백 처리 로직 구현
    // 예: 인증 코드를 서버로 전송하고 토큰을 받아온 후 메인 화면으로 이동
    const { code, error } = params;

    if (error) {
      // 에러 처리
      console.error('OAuth error:', error);
      router.replace('/(auth)/login');
      return;
    }

    if (code) {
      // 인증 코드 처리
      console.log('OAuth code:', code);
      // TODO: 서버로 코드 전송 및 토큰 저장
      router.replace('/(tabs)');
    }
  }, [params, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '인증 중...',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>인증 처리 중...</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
});
