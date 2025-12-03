import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';

/**
 * 404 에러 핸들러
 * 404 Not Found handler for Expo Router
 *
 * 존재하지 않는 라우트 접근 시 표시됩니다.
 * Displayed when accessing non-existent routes.
 */
const NotFoundScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없음' }} />
      <View style={styles.content}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>페이지를 찾을 수 없습니다</Text>
        <Text style={styles.description}>요청하신 페이지가 존재하지 않거나 이동되었습니다.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로 이동</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  code: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotFoundScreen;
