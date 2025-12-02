import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { logger } from '@repo/shared/utils';

interface ErrorProps {
  error: Error;
  retry?: () => void;
}

/**
 * Global error handler for Expo Router
 *
 * Handles errors at the route level.
 */
const ErrorScreen = ({ error, retry }: ErrorProps) => {
  const router = useRouter();

  useEffect(() => {
    logger.error('Route error occurred', {
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  const handleRetry = () => {
    if (retry) {
      retry();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '오류' }} />
      <View style={styles.content}>
        <Text style={styles.title}>An error occurred</Text>
        <Text style={styles.description}>A temporary error occurred. Please try again later.</Text>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonOutline]}
            onPress={() => router.replace('/')}
          >
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Go to home</Text>
          </Pressable>
        </View>
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
  actions: {
    gap: 12,
    width: '100%',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: '#6366f1',
  },
});

export default ErrorScreen;
