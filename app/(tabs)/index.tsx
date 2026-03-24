import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';

const categories = [
  { id: '1', name: 'Tất cả', icon: 'grid' as const },
  { id: '2', name: 'Sách', icon: 'book' as const },
  { id: '3', name: 'Đồ cho nam', icon: 'user' as const },
  { id: '4', name: 'Thời trang nữ', icon: 'shopping-bag' as const },
  { id: '5', name: 'Đồ làm đẹp', icon: 'zap' as const },
  { id: '6', name: 'Xe', icon: 'truck' as const },
  { id: '7', name: 'Đồ văn phòng', icon: 'briefcase' as const },
  { id: '8', name: 'Điện tử', icon: 'cpu' as const },
];

const products = [
  { id: '1', title: 'MacBook Pro M3 Max 14"', price: '64.900.000đ', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', condition: 'Tốt: đã mở hộp mới 100%', location: 'Hồ Chí Minh' },
  { id: '2', title: 'iPhone 15 Pro Max 256GB Gold', price: '29.490.000đ', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', condition: 'Như mới: đã mở hộp, mới 99%', location: 'Hà Nội' },
  { id: '3', title: 'iPad Pro M2 12.9" Cellular', price: '24.500.000đ', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', condition: 'Trung bình: đã qua sở dụng, đầy đủ chức năng, lỗi nhẹ', location: 'Đà Nẵng' },
  { id: '4', title: 'AirPods Max Sky Blue', price: '9.800.000đ', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', condition: 'Kém: đồ cũ, nhiều lỗi, đã hư', location: 'Hồ Chí Minh' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* New Navbar Style - Modern Search Left, Icons Right */}
        <TopNavbar placeholder="test test" />
 
 
        {/* Categories Section - No Lines */}
        <View className="mb-10">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {categories.map((cat, index) => (
              <TouchableOpacity 
                key={cat.id} 
                className={`items-center mr-4 px-6 py-4 rounded-2xl ${index === 0 ? 'bg-secondary' : 'bg-surface-container'}`}
              >
                <View className="flex-row items-center">
                   <Feather name={cat.icon} size={16} color={index === 0 ? "#3C1300" : "#F9F9F9"} />
                   <Text className={`ml-3 font-black text-xs uppercase tracking-widest ${index === 0 ? 'text-[#3C1300]' : 'text-primary'}`}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
 
        {/* Featured Section Header */}
        <View className="flex-row items-end justify-between px-6 mb-8">
          <View>
             <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Editor's Choice</Text>
             <Text className="text-2xl font-black text-primary tracking-tighter">DÀNH CHO BẠN</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-secondary font-bold text-xs uppercase tracking-widest">Xem tất cả</Text>
          </TouchableOpacity>
        </View>
 
        {/* Product Grid - 3 Column Layout */}
        <View className="px-4 flex-row flex-wrap justify-between pb-32">
          {products.map((item) => (
            <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
              <ProductCard
                title={item.title}
                price={item.price}
                image={item.image}
                condition={item.condition}
                location={item.location}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
