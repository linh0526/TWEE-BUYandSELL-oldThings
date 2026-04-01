import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { CartProvider } from '../context/CartContext';

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

export default function RootLayout() {
  return (
    <CartProvider>
      <ThemeProvider value={CuratorTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </CartProvider>
  );
}