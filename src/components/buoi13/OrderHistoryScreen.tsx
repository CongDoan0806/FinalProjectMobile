import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { fetchUserOrders, Order } from '../../database';
import { useAuth } from './AuthContext';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const userOrders = await fetchUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('❌ Lỗi khi tải lịch sử đơn hàng:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.productName}>Sản phẩm: {item.productName}</Text>
        <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.totalPrice}>
          Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')}đ
        </Text>
        <Text style={styles.orderDate}>Ngày đặt: {item.orderDate}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lịch sử mua hàng</Text>
      
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default OrderHistoryScreen;