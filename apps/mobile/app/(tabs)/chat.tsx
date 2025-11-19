import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅</Text>
      {/* TODO: 채팅 리스트 구현 */}
    </View>
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
  },
});
