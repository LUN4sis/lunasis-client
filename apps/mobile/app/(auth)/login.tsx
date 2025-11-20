import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '로그인',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>
        {/* TODO: 로그인 폼 구현 */}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
