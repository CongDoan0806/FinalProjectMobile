import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  if (!user) {
    return null; // Không hiển thị header nếu chưa đăng nhập
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.role}>
            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </View>
      </View>
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#00FFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  userDetails: {
    flex: 1
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  role: {
    fontSize: 12,
    color: '#666'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFFF'
  }
});

export default Header;

