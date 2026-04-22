import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { getImageUrl } from '@/utils/image';

export default function SavedItemsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product:product_id (
            id,
            title,
            price,
            images,
            condition,
            status,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách tin đã lưu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [user]);

  const formatPrice = (price: any) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-black uppercase tracking-tighter text-primary">Tin đã lưu</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7524" />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-gray-50/30" showsVerticalScrollIndicator={false}>
          {items.length > 0 ? (
            items.map((fav) => {
              const product = fav.product;
              if (!product) return null;

              return (
                <TouchableOpacity
                  key={fav.id}
                  onPress={() => router.push({ pathname: '/product', params: { id: product.id } })}
                  className="bg-white m-4 mb-0 p-6 rounded-[32px] border border-gray-100 shadow-sm"
                >
                  <View className="flex-row">
                    <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center overflow-hidden">
                      <Image
                        source={{ uri: getImageUrl(product.images) }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                      />
                    </View>
                    <View className="flex-1 ml-4 justify-between py-1">
                      <View>
                        <Text className="text-primary font-black text-sm" numberOfLines={2}>{product.title}</Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-[8px] font-black text-gray-400 uppercase italic">Tình trạng: {product.condition || 'Tốt'}</Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-end">
                        <Text className="text-secondary font-black text-lg">{formatPrice(product.price)}</Text>
                        { (product.status === 'sold' || (product.quantity || 0) <= 0) && (
                          <View className="bg-red-50 px-2 py-1 rounded-md">
                            <Text className="text-[8px] font-black text-red-500 uppercase">Hết hàng</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center py-40">
              <MaterialCommunityIcons name="heart-outline" size={80} color="#EEE" />
              <Text className="text-gray-300 font-black mt-4 uppercase text-[10px] tracking-widest">Chưa có tin đăng nào được lưu</Text>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
