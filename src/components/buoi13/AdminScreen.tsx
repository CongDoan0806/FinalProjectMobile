import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useAuth } from './AuthContext';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { BottomTabParamList } from './AppTabs';

type AdminScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'AdminTab'>,
  NativeStackNavigationProp<HomeStackParamList>
>;

const AdminScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<AdminScreenNavigationProp>();

  const adminMenuItems = [
    {
      id: 1,
      title: 'Quản lý sản phẩm',
      subtitle: 'Thêm, sửa, xóa sản phẩm',
      icon: '🛍️',
      // onPress: () => navigation.navigate('ProductManagement', { categoryId: 0 }),
      onPress: () => {
        navigation.navigate('HomeTab', { 
          screen: 'ProductManagement' 
        });
      },
       color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Quản lý danh mục',
      subtitle: 'Quản lý các danh mục sản phẩm',
      icon: '🏷️',
      onPress: () => {
        navigation.navigate('HomeTab', { 
          screen: 'CategoryManagement' 
        });
      },
       color: '#2196F3'
    },
    {
      id: 3,
      title: 'Quản lý người dùng',
      subtitle: 'Xem và quản lý tài khoản',
      icon: '👤',
      onPress: () => {
        navigation.navigate('HomeTab', { 
          screen: 'UserManagement' 
        });
      },
       color: '#FF9800'
    },
    {
      id: 4,
      title: 'Thống kê',
      subtitle: 'Xem báo cáo và thống kê',
      icon: '📈',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
      color: '#9C27B0'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Chào mừng, {user?.username}!</Text>
          <Text style={styles.roleText}>Trang quản trị hệ thống</Text>
        </View>

        <View style={styles.menuContainer}>
          {adminMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Thống kê nhanh</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Danh mục</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1+</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  roleText: {
    fontSize: 16,
    color: '#666'
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginBottom: 10
  },
  menuItem: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    marginBottom: 1
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff'
  },
  menuTextContainer: {
    flex: 1
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  arrowIcon: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: 'bold'
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00B8CC',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 14,
    color: '#666'
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  }
});

export default AdminScreen;