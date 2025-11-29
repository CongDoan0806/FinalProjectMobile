import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { fetchCategories, addCategory, deleteCategory, fetchCategoryById, updateCategory } from '../../database';
import { useNavigation } from '@react-navigation/native';
const CategoryManagementScreen = () => {
  const [categories, setCategories] = React.useState<{id: number, name: string}[]>([]);
  const [isModal, setIsModal] = React.useState(false);
  const [categoryName, setCategoryName] = React.useState('');
  const [editingCategoryId, setEditingCategoryId] = React.useState<number | null>(null);
  React.useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleAddCategory = async (item:string) => {
    if (item.trim() === '') {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return;
    }
    await addCategory(item);
    setCategories([...categories, { id: categories.length + 1, name: item }]);
    setCategoryName('');
    setIsModal(false);
  }

  const handleDeleteCategory = (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa danh mục này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(id);
            setCategories(categories.filter(cat => cat.id !== id));
          }
        }
      ]
    );
  };

  const handleShowCategory = async (id: number) => {
    const data = await fetchCategoryById(id);
    if (data) {
      setCategoryName(data.name);
      setEditingCategoryId(id);
      setIsModal(true);
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy danh mục');
    }
  };

  const handleEditCategory = async (id: number, name: string) => {
    if (name.trim() === '') {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return;
    }
    await updateCategory(id, name);
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, name } : cat
    );
    setCategories(updatedCategories);
    setCategoryName('');
    setIsModal(false);
  }

  const handleModal = () => {
    setIsModal(!isModal);
    setCategoryName('');
    setEditingCategoryId(null);
  };

  const navigation = useNavigation();
  const renderCategory = ({ item } : { item: {id: number, name: string} }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>🏷️</Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryId}>ID: {item.id}</Text>
        </View>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleShowCategory(item.id)}>
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteCategory(item.id)}>
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý danh mục</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleModal()}>
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
          </View>
        }
      />

      {/* Modal thêm/sửa danh mục */}
      <Modal
        visible={isModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên danh mục</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên danh mục"
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => handleModal()}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={() => {
                if (editingCategoryId) {
                  handleEditCategory(editingCategoryId, categoryName);
                } else {
                  handleAddCategory(categoryName);
                }
              }}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      <Modal visible={false} transparent={true}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00FFFF" />
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
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fff'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  listContainer: {
    padding: 15
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryIconText: {
    fontSize: 20
  },
  categoryDetails: {
    flex: 1
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  categoryId: {
    fontSize: 12,
    color: '#666'
  },
  categoryActions: {
    flexDirection: 'row'
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8
  },
  editButton: {
    backgroundColor: '#4CAF50'
  },
  deleteButton: {
    backgroundColor: '#f44336'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
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
    width: '90%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 20
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    backgroundColor: '#00FFFF'
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

export default CategoryManagementScreen;