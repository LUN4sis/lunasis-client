import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>랭킹</Text>
      {/* TODO: 랭킹 리스트 구현 */}
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
