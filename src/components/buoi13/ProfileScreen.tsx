import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { updateUserProfile } from '../../database';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const newPassword = password || user!.password;
      await updateUserProfile(user!.id, username, newPassword);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật profile:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Giỏ hàng',
      icon: '🛒',
      onPress: () => navigation.navigate('Cart' as never),
    },
    {
      title: 'Lịch sử mua hàng',
      icon: '📋',
      onPress: () => navigation.navigate('OrderHistory' as never),
    },
    {
      title: 'Trò chuyện với AI',
      icon: '🤖',
      onPress: () => navigation.navigate('Chat' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Thông tin cá nhân</Text>
          <Text style={styles.roleText}>Vai trò: {user?.role}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cập nhật thông tin</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới (để trống nếu không đổi)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.updateBtn, loading && styles.disabledBtn]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Text style={styles.updateBtnText}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức năng</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Text style={styles.logoutBtnText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  updateBtn: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;