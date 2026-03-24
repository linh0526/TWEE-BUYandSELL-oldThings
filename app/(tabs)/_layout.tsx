import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = '#FF7524'; // Kinetic Orange

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#ADAAAA',
        headerShown: false,
        tabBarStyle: {
           height: 90,
           paddingBottom: 35,
           paddingTop: 12,
           borderTopWidth: 0,
           backgroundColor: '#0E0E0E',
           elevation: 0,
        },
        tabBarLabelStyle: {
           fontSize: 9,
           fontWeight: '900',
           textTransform: 'uppercase',
           letterSpacing: 1.2,
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
                borderWidth: 4,
                borderColor: '#0E0E0E',
              }}
            >
              <Feather name="plus" size={32} color="#000" />
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
    </Tabs>
  );
}
