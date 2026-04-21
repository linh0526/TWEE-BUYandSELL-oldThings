import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import React from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CuratorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF7524',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: 'rgba(0, 0, 0, 0.05)',
    notification: '#FF7524',
  },
};

import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22C55E', height: 80, borderLeftWidth: 10, borderRadius: 16 }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      text1Style={{
        fontSize: 22,
        fontWeight: '900',
        color: '#1A1A1A'
      }}
      text2Style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#666'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#EF4444', height: 100, borderLeftWidth: 12, borderRadius: 20 }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      text1Style={{
        fontSize: 22,
        fontWeight: '900',
        color: '#1A1A1A'
      }}
      text2Style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#666'
      }}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: '#FF7524', height: 100, borderLeftWidth: 12, borderRadius: 20 }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      text1Style={{
        fontSize: 22,
        fontWeight: '900',
        color: '#1A1A1A'
      }}
      text2Style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#666'
      }}
    />
  ),
};

function RootLayout() {
  const fetchCategories = useCategoryStore(state => state.fetchCategories);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider value={CuratorTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="search" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="shop/[id]" />
          </Stack>
          <StatusBar style="dark" />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default RootLayout;