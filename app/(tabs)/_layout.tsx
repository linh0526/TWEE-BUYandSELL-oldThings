import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const activeColor = '#FF7524'; // Kinetic Orange

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
        tabBarStyle: {
           height: Platform.OS === 'ios' ? 88 : 70,
           paddingBottom: Platform.OS === 'ios' ? 30 : 15,
           paddingTop: 10,
           borderTopWidth: 1,
           borderTopColor: '#F0F0F0',
           backgroundColor: '#FFFFFF',
           elevation: 10,
           shadowColor: '#000',
           shadowOffset: { width: 0, height: -2 },
           shadowOpacity: 0.05,
           shadowRadius: 10,
        },
        tabBarLabelStyle: {
           fontSize: 9,
           fontWeight: '900',
           textTransform: 'uppercase',
           letterSpacing: 1.2,
           marginBottom: Platform.OS === 'ios' ? 0 : 2,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }: { color: string }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color }: { color: string }) => <Feather name="grid" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Đăng bán',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View 
              style={{
                width: 62,
                height: 62,
                backgroundColor: '#FF7524',
                borderRadius: 31,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -25, // Overflow effect
                shadowColor: '#FF7524',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }}
            >
              <Feather name="plus" size={32} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }: { color: string }) => <Feather name="bell" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }: { color: string }) => <Feather name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
