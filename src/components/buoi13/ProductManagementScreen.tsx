import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { fetchCategories, fetchProducts, addProduct, deleteProduct, updateProduct } from '../../database';
type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};
const ProductManagementScreen = () => {
  const [products, setProducts] = React.useState<Array<Product>>([]);
  const [categories, setCategories] = React.useState<Array<{ id: number; name: string }>>([]);
  const [isModal, setIsModal] = React.useState(false);
  const [productName, setProductName] = React.useState('');
  const [productPrice, setProductPrice] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      }
    };
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải danh mục:', error);
      }
    };
    loadCategories();
    loadProducts();
  }, []);


  const handleModal = (product?: Product) => {
    setIsModal(!isModal);
    if (!isModal) {
      if (product) {
        // Edit mode
        setEditingProduct(product);
        setProductName(product.name);
        setProductPrice(product.price.toString());
        setSelectedCategoryId(product.categoryId);
        setImageUrl(product.img.startsWith('http') ? product.img : '');
      } else {
        // Add mode
        setEditingProduct(null);
        setProductName('');
        setProductPrice('');
        setSelectedCategoryId(1);
        setImageUrl('');
      }
    } else {
      setEditingProduct(null);
    }
  };

  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      Alert.alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    
    const price = parseFloat(productPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Vui lòng nhập giá hợp lệ');
      return;
    }

    try {
      setLoading(true);
      
      if (editingProduct) {
        // Update existing product
        await updateProduct({
          id: editingProduct.id,
          name: productName.trim(),
          price: price,
          img: imageUrl.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Cập nhật sản phẩm thành công!');
      } else {
        // Add new product
        await addProduct({
          name: productName.trim(),
          price: price,
          img: imageUrl.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Thêm sản phẩm thành công!');
      }
      
      const data = await fetchProducts();
      setProducts(data);
      setIsModal(false);
    } catch (error) {
      console.error('❌ Lỗi khi lưu sản phẩm:', error);
      Alert.alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(productId);
              const data = await fetchProducts();
              setProducts(data);
              Alert.alert('Xóa sản phẩm thành công!');
            } catch (error) {
              console.error('❌ Lỗi khi xóa sản phẩm:', error);
              Alert.alert('Có lỗi xảy ra khi xóa sản phẩm');
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  }

  const getCategoryName = (categoryId: any) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const renderProduct = ({ item }: { item: { id: number; name: string; price: number; img: string; categoryId: number }}) => (
    <View style={styles.productItem}>
      <Image 
        source={item.img.startsWith('http') ? {uri: item.img} : require('../../../assets/images/avt1.jpg')} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.productCategory}>Danh mục: {getCategoryName(item.categoryId)}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleModal(item)}>
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteProduct(item.id)}>
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleModal()}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⚡</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Lọc theo danh mục:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryFilters}>
            <TouchableOpacity style={[styles.filterChip, styles.activeFilter]}>
              <Text style={[styles.filterChipText, styles.activeFilterText]}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.filterChip}>
                <Text style={styles.filterChipText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
          </View>
        }
      />

      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        visible={isModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</Text>

              {/* Product Image URL */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>URL hình ảnh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#999"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>

              {/* Product Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên sản phẩm *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên sản phẩm"
                  placeholderTextColor="#999"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>

              {/* Product Price */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giá sản phẩm (VNĐ) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={productPrice}
                  onChangeText={setProductPrice}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Danh mục *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[styles.categoryButton, selectedCategoryId === category.id && styles.selectedCategory]}
                        onPress={() => setSelectedCategoryId(category.id)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            selectedCategoryId === category.id && styles.selectedCategoryText
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>


              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => handleModal()}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveProduct}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>{editingProduct ? 'Cập nhật' : 'Thêm'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      <Modal visible={loading} transparent={true}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00B8CC" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00B8CC',
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
    color: '#fff'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center'
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20
  },
  addButtonText: {
    fontSize: 20,
    color: '#fff'
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#666'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  categoryFilters: {
    flexDirection: 'row'
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  activeFilter: {
    backgroundColor: '#00B8CC',
    borderColor: '#00B8CC'
  },
  filterChipText: {
    fontSize: 14,
    color: '#666'
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 14,
    color: '#00B8CC',
    fontWeight: '600',
    marginBottom: 2
  },
  productCategory: {
    fontSize: 12,
    color: '#666'
  },
  productActions: {
    flexDirection: 'row'
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  editButton: {
    backgroundColor: '#4CAF50'
  },
  deleteButton: {
    backgroundColor: '#f44336'
  },
  actionButtonText: {
    fontSize: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
    width: '90%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  imageSection: {
    marginBottom: 20
  },
  imageUpload: {
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  imageUploadIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  imageUploadText: {
    fontSize: 14,
    color: '#666'
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  categoryContainer: {
    flexDirection: 'row'
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedCategory: {
    backgroundColor: '#00B8CC',
    borderColor: '#00B8CC'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666'
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  saveButton: {
    backgroundColor: '#00B8CC'
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default ProductManagementScreen;