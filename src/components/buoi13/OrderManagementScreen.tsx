import React, { useState, useEffect } from 'react';
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
import { fetchOrders, updateOrderStatus, Order } from '../../database';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: '#ffc107' },
    { value: 'processing', label: 'Đang xử lý', color: '#17a2b8' },
    { value: 'completed', label: 'Hoàn thành', color: '#28a745' },
    { value: 'cancelled', label: 'Đã hủy', color: '#dc3545' },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('❌ Lỗi khi tải đơn hàng:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      await loadOrders();
      setModalVisible(false);
      setSelectedOrder(null);
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setModalVisible(true);
  };



  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <View style={[styles.statusContainer, { backgroundColor: statusOptions.find(s => s.value === item.status)?.color || '#6c757d' }]}>
          <Text style={styles.statusText}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>Khách hàng: {item.customerName}</Text>
        <Text style={styles.productName}>Sản phẩm: {item.productName}</Text>
        <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.totalPrice}>
          Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')}đ
        </Text>
        <Text style={styles.orderDate}>Ngày đặt: {item.orderDate}</Text>
      </View>

      <TouchableOpacity
        style={styles.updateBtn}
        onPress={() => openStatusModal(item)}
      >
        <Text style={styles.updateBtnText}>Cập nhật trạng thái</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản trị đơn hàng</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm đơn hàng..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái đơn hàng</Text>
            
            {selectedOrder && (
              <View style={styles.orderSummary}>
                <Text style={styles.summaryText}>Đơn hàng #{selectedOrder.id}</Text>
                <Text style={styles.summaryText}>Khách hàng: {selectedOrder.customerName}</Text>
              </View>
            )}

            <Text style={styles.statusLabel}>Chọn trạng thái mới:</Text>
            
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  newStatus === option.value && styles.statusOptionActive
                ]}
                onPress={() => setNewStatus(option.value)}
              >
                <View style={[styles.statusIndicator, { backgroundColor: option.color }]} />
                <Text style={styles.statusOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleUpdateStatus}
              >
                <Text style={styles.saveBtnText}>Cập nhật</Text>
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
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  updateBtn: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginBottom: 16,
    color: '#333',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  statusOptionActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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

export default OrderManagementScreen;