import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { addUser, fetchUsers, updateUser, deleteUser } from '../../database';
type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};
const UserManagementScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Array<User>>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      }
    };
    loadUsers();
  }, []);
  const handleSaveUser = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, formData.username, formData.password, formData.role);
    } else {
      await addUser(formData.username, formData.password, formData.role);
    }
    const data = await fetchUsers();
    setUsers(data);
    resetForm();
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setModalVisible(true);
  }


  const handleDeleteUser = (id: number) => {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn xóa user này?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: async () => {
              try {
                await deleteUser(id);;
                const data = await fetchUsers();
                setUsers(data);
                Alert.alert('Xóa user thành công!');
              } catch (error) {
                console.error('❌ Lỗi khi xóa user:', error);
                Alert.alert('Có lỗi xảy ra khi xóa user');
              } 
            } 
          }
        ]
      );
    }
  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'user' });
    setEditingUser(null);
    setModalVisible(false);
  };  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Vai trò: {item.role}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteUser(item.id)}
        >
          <Text style={styles.actionBtnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý người dùng</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm người dùng..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addBtnText}>+ Thêm người dùng</Text>
      </TouchableOpacity>

      <FlatList
        data={users.filter(user =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUserItem}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChangeText={text => setFormData({ ...formData, username: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Vai trò:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    formData.role === 'user' && styles.roleBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'user' })}
                >
                  <Text style={styles.roleBtnText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    formData.role === 'admin' && styles.roleBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'admin' })}
                >
                  <Text style={styles.roleBtnText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUser}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  role: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editBtn: {
    backgroundColor: '#28a745',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserManagementScreen;