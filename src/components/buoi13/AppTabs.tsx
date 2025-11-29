import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackScreen from './HomeStackScreen';
import SignupScreen from './SignupScreen';
import LoginScreen from './LoginScreen';
import AdminScreen from './AdminScreen';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';

export type BottomTabParamList = {
  HomeTab: { screen?: keyof HomeStackParamList } | undefined;
  SignupTab: undefined;
  LoginTab: undefined;
  AdminTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00B8CC',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏪</Text>
          ),
        }}
      />
      {user && user.role === 'admin' && (
        <Tab.Screen
          name="AdminTab"
          component={AdminScreen}
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👑</Text>
            ),
          }}
        />
      )}

      <Tab.Screen
        name="SignupTab"
        component={SignupScreen}
        options={{
          title: 'Sign up',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="LoginTab"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🚪</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
