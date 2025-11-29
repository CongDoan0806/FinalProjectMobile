import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';
import ProductsByCategoryScreen from './ProductByCategoryScreen';
import CategoriesScreen from './CategoriesScreen';
import AdminScreen from './AdminScreen';
// import ProductManagementScreen from './ProductManagementScreen';
// import UserManagementScreen from './UserManagementScreen';
// import CategoryManagementScreen from './CategoryManagementScreen';
import { HomeStackParamList } from './types';
import CategoryManagementScreen from './CategoryManagementScreen';
import ProductManagementScreen from './ProductManagementScreen';
import ChatScreen from './ChatScreen';
import UserManagementScreen from './UserManagementScreen';
import OrderManagementScreen from './OrderManagementScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import ProfileScreen from './ProfileScreen';

// export type HomeStackParamList = {
//   Home: undefined;
//   Details: { product: { id: string; name: string; price: string; image: any } };
// };

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;