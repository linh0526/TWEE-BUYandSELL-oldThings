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

function RootLayout() {
  const fetchCategories = useCategoryStore(state => state.fetchCategories);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider value={CuratorTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default RootLayout;