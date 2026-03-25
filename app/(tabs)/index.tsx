import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import { STATIC_CATEGORIES } from '@/constants/data';

const products = [
  { id: '1', title: 'MacBook Pro M3 Max 14"', price: '64.900.000đ', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', condition: 'Tốt: đã mở hộp mới 100%', location: 'Hồ Chí Minh' },
  { id: '2', title: 'iPhone 15 Pro Max 256GB Gold', price: '29.490.000đ', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', condition: 'Như mới: đã mở hộp, mới 99%', location: 'Hà Nội' },
  { id: '3', title: 'iPad Pro M2 12.9" Cellular', price: '24.500.000đ', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', condition: 'Trung bình: đã qua sở dụng, đầy đủ chức năng, lỗi nhẹ', location: 'Đà Nẵng' },
  { id: '4', title: 'AirPods Max Sky Blue', price: '9.800.000đ', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', condition: 'Kém: đồ cũ, nhiều lỗi, đã hư', location: 'Hồ Chí Minh' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* New Navbar Style - Modern Search Left, Icons Right */}
        <TopNavbar placeholder="Tìm kiếm sản phẩm..." isHome={true} />

        {/* Categories Section - Circular with Static Data */}
        <View className="mb-10 mt-6">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {STATIC_CATEGORIES.map((cat, index) => (
              <TouchableOpacity 
                key={cat.id} 
                className="items-center mr-6"
                onPress={() => router.push('/explore')}
              >
                <View className={`w-16 h-16 rounded-full overflow-hidden mb-2 shadow-sm ${index === 0 ? 'border-4 border-secondary' : 'border border-outline'}`}>
                   {cat.image_url ? (
                     <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                   ) : (
                     <View className="flex-1 items-center justify-center bg-gray-100">
                        <Feather name="grid" size={20} color="#999" />
                     </View>
                   )}
                </View>
                <Text 
                  className={`font-black text-[9px] uppercase tracking-tighter ${index === 0 ? 'text-secondary' : 'text-primary/60'}`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
 
        {/* Featured Section Header */}
        <View className="flex-row items-end justify-between px-6 mb-8 mt-6">
          <View>
             <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Editor's Choice</Text>
             <Text className="text-2xl font-black text-primary tracking-tighter">DÀNH CHO BẠN</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-secondary font-bold text-xs uppercase tracking-widest">Xem tất cả</Text>
          </TouchableOpacity>
        </View>
 
        {/* Product Grid - 3 Column Layout */}
        <View className="px-4 flex-row flex-wrap justify-between">
          {products.map((item) => (
            <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
              <ProductCard
                title={item.title}
                price={item.price}
                image={item.image}
                location={item.location}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
