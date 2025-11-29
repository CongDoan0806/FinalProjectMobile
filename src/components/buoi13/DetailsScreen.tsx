import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { addToCart, fetchProductById } from '../../database';
import { useAuth } from './AuthContext';

type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { product } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      // Tìm product trong database bằng ID
      const dbProduct = await fetchProductById(parseInt(product.id));
      if (dbProduct) {
        await addToCart(user.id, dbProduct.id, 1);
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá:</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>

          <View style={styles.divider} />

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Thông Tin Sản Phẩm</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã sản phẩm:</Text>
              <Text style={styles.detailValue}>#{product.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tên sản phẩm:</Text>
              <Text style={styles.detailValue}>{product.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá bán:</Text>
              <Text style={styles.detailValue}>{product.price}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô Tả</Text>
            <Text style={styles.descriptionText}>
              Sản phẩm chất lượng cao, được chọn lọc kỹ càng. 
              Đảm bảo chất lượng và uy tín. Giao hàng nhanh chóng, 
              đóng gói cẩn thận.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>Thêm Vào Giỏ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
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
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  productImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 10
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  priceLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 10
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20
  },
  detailsSection: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right'
  },
  descriptionSection: {
    marginBottom: 20
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'justify'
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#00FFFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00FFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DetailsScreen;
