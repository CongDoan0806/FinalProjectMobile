import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { fetchCartItems, updateCartQuantity, removeFromCart, CartItem } from '../../database';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      loadCartItems();
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

  const handleQuantityChange = async (cartId: number, newQuantity: number) => {
    try {
      await updateCartQuantity(cartId, newQuantity);
      await loadCartItems();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số lượng:', error);
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(cartId);
              await loadCartItems();
            } catch (error) {
              console.error('❌ Lỗi khi xóa sản phẩm:', error);
            }
          }
        }
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống');
      return;
    }
    navigation.navigate('Checkout' as never);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemPrice}>{item.productPrice.toLocaleString('vi-VN')}đ</Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityBtnText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          {(item.productPrice * item.quantity).toLocaleString('vi-VN')}đ
        </Text>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeBtnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id.toString()}
            renderItem={renderCartItem}
            style={styles.cartList}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString('vi-VN')}đ
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
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
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityBtn: {
    backgroundColor: '#007bff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  removeBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  checkoutBtn: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;