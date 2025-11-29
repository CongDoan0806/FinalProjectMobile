import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ImageSourcePropType,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Product1 } from './types';
import { Product, Category, fetchCategories, fetchProductsByCategory } from '../../database';
import CategorySelector from './CategorySelector';

type ProductsByCategoryRouteProp = RouteProp<HomeStackParamList, 'ProductsByCategory'>;
type ProductsByCategoryNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ProductsByCategory'>;

// Sử dụng hình ảnh placeholder từ assets có sẵn
const productImages: ImageSourcePropType[] = [
  require('../../../assets/images/avt1.jpg'),
  require('../../../assets/images/copimage.png'),
  require('../../../assets/images/avt1.jpg'),
  require('../../../assets/images/copimage.png'),
];

// Hàm convert Product từ database sang Product1 để hiển thị
const convertProductToProduct1 = (product: Product): Product1 => {
  return {
    id: product.id.toString(),
    name: product.name,
    price: `${product.price.toLocaleString('vi-VN')}đ`,
    image: product.img.startsWith('http') ? { uri: product.img } : productImages[product.id % productImages.length]
  };
};

export default function ProductsByCategoryScreen() {
  const route = useRoute<ProductsByCategoryRouteProp>();
  const navigation = useNavigation<ProductsByCategoryNavigationProp>();
  const { categoryId } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải danh mục:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchProductsByCategory(selectedCategoryId);
        setProducts(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoadingProducts(false);
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategoryId]);

  const getImageSource = (img: string) => {
    if (img.startsWith('http')) return { uri: img };
    // Sử dụng hình ảnh placeholder từ assets có sẵn
    return require('../../../assets/images/avt1.jpg');
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? selectedCategory.name : 'Sản phẩm'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={(id) => setSelectedCategoryId(id)}
      />

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFFF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const product1 = convertProductToProduct1(item);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Details', { product: product1 })}
                activeOpacity={0.7}
              >
                <Image source={getImageSource(item.img)} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} đ</Text>
                </View>
                <Text style={styles.arrow}>➡️</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Chưa có sản phẩm nào trong danh mục này</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00FFFF',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center'
  },
  listContainer: {
    padding: 15
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0'
  },
  info: {
    justifyContent: 'center',
    flex: 1
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
    color: '#333'
  },
  price: {
    fontSize: 16,
    color: '#00FFFF',
    fontWeight: '700'
  },
  arrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});