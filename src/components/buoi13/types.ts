import { ImageSourcePropType } from 'react-native';

// interface trước khi tạo Category
export interface Product1 {
  id: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
}

// interface khi tạo Category
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId: number;
}

// Kiểu danh sách màn hình trong Stack
export type HomeStackParamList = {
  Home: undefined;
  Details: { product: Product1 };
  ProductsByCategory: { categoryId: number };
  Accessory: undefined;
  Fashion: undefined;
  Categories: undefined;
  About: undefined;
  Chat: undefined;

  AdminDashboard: undefined;
  CategoryManagement: undefined;
  UserManagement: undefined;
  OrderManagement: undefined;
  AddUser: undefined;
  EditUser: { userId: number };
  ProductManagement: { categoryId: number };
  
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
  Profile: undefined;
};
