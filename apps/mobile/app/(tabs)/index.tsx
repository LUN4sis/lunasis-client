import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>캘린더</Text>
      {/* TODO: 캘린더 구현 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
