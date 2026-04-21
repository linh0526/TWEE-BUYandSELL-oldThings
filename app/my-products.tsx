import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

export default function MyProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Lỗi lấy tin đăng:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [user]);

  const formatPrice = (price: number) => {
    if (!price) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Thêm dòng này để ẩn header mặc định của Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header tùy chỉnh của bạn */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-black uppercase tracking-tighter text-primary">Tin đăng của tôi</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7524" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between">
            {products.map((item) => (
              <View key={item.id} style={{ width: '48%', marginBottom: 16 }}>
                <ProductCard
                  title={item.title}
                  price={formatPrice(item.price)}
                  image={item.images?.[0]}
                  location={item.location}
                  onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                />
                {/* Badge trạng thái */}
                <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg">
                  <Text className="text-white text-[8px] font-black uppercase">{item.status}</Text>
                </View>
              </View>
            ))}
          </View>

          {products.length === 0 && (
            <View className="items-center py-20">
              <Feather name="package" size={64} color="#F0F0F0" />
              <Text className="text-gray-400 font-bold mt-4 uppercase text-[10px] tracking-widest">Bạn chưa có tin đăng nào</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/post')}
                className="mt-6 bg-secondary px-8 py-3 rounded-2xl"
              >
                <Text className="text-[#3C1300] font-black uppercase text-xs">Đăng tin ngay</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
