import React, { useState, useEffect } from 'react';
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
import { fetchCartItems, createOrder, CartItem } from '../../database';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const CheckoutScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      loadCartItems();
      setCustomerName(user.username);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    try {
      const items = await fetchCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('❌ Lỗi khi tải giỏ hàng:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    setLoading(true);
    try {
      await createOrder(user!.id, customerName, cartItems);
      Alert.alert(
        'Thành công',
        'Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home' as never)
          }
        ]
      );
    } catch (error) {
      console.error('❌ Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={customerName}
            onChangeText={setCustomerName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Địa chỉ giao hàng"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>
          
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.productPrice * item.quantity).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>
              {getTotalPrice().toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderBtnText}>
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
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
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  placeOrderBtn: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  placeOrderBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;