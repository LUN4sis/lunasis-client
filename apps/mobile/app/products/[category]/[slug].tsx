import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function ProductDetailScreen() {
  const { category, slug } = useLocalSearchParams<{ category: string; slug: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: '상품 상세',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>카테고리: {category}</Text>
          <Text style={styles.subtitle}>슬러그: {slug}</Text>
          {/* TODO: 상품 상세 정보 구현 */}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});
