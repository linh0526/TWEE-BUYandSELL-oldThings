import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TopNavbar from '@/components/TopNavbar';

const CATEGORIES = [
  { id: '1', name: 'SÁCH & TRI THỨC', icon: 'book', color: 'bg-surface-container-high', count: '1.2k+' },
  { id: '2', name: 'ĐỒ CHO NAM', icon: 'user', color: 'bg-secondary', text: 'text-[#3C1300]', count: '850+' },
  { id: '3', name: 'THỜI TRANG NỮ', icon: 'shopping-bag', color: 'bg-surface-container', count: '2.4k+' },
  { id: '4', name: 'ĐỒ LÀM ĐẸP', icon: 'zap', color: 'bg-surface-bright', count: '600+' },
  { id: '5', name: 'PHƯƠNG TIỆN / XE', icon: 'truck', color: 'bg-surface-container-high', count: '200+' },
  { id: '6', name: 'ĐỒ VĂN PHÒNG', icon: 'briefcase', color: 'bg-secondary', text: 'text-[#3C1300]', count: '450+' },
  { id: '7', name: 'THIẾT BỊ ĐIỆN TỬ', icon: 'cpu', color: 'bg-surface-container', count: '3.1k+' },
  { id: '8', name: 'KHÁC', icon: 'grid', color: 'bg-surface-container-high', count: '-' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopNavbar placeholder="Tìm kiếm trong danh mục..." />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Featured Hero for Explore */}
          <TouchableOpacity 
            activeOpacity={0.9}
            className="w-full h-48 bg-primary rounded-[32px] overflow-hidden mb-10 relative"
          >
             <View className="p-8 z-10 flex-1 justify-center">
                <Text className="text-background text-[10px] font-bold uppercase tracking-widest mb-2">Must See Collections</Text>
                <Text className="text-background text-3xl font-black tracking-tighter uppercase leading-none">Siêu Phẩm{"\n"}Công Nghệ.</Text>
                <TouchableOpacity className="mt-6 bg-secondary px-6 py-2 rounded-lg self-start">
                   <Text className="text-[#3C1300] font-black text-[10px] uppercase tracking-widest">Xem ngay</Text>
                </TouchableOpacity>
             </View>
             <View className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <Feather name="cpu" size={180} color="black" />
             </View>
          </TouchableOpacity>

          {/* Main Categories Grid */}
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                activeOpacity={0.8}
                className={`${cat.color} p-6 rounded-[28px] mb-4`}
                style={{ width: '48%', height: 160 }}
              >
                <View className="flex-1 justify-between">
                   <View className="bg-primary/10 self-start p-3 rounded-2xl">
                    <Feather name={cat.icon as any} size={20} color={cat.text === 'text-[#3C1300]' ? "#3C1300" : "#FF7524"} />
                   </View>
                   <View>
                      <Text className={`font-black text-xs uppercase tracking-widest leading-tight ${cat.text || 'text-primary'}`}>
                        {cat.name}
                      </Text>
                      <Text className={`text-[9px] font-black mt-2 uppercase opacity-50 ${cat.text || 'text-primary'}`}>
                        {cat.count} Sản phẩm
                      </Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Browse Bar */}
          <View className="mt-10 mb-20 bg-surface-container rounded-3xl p-8">
            <Text className="text-xl font-black text-primary tracking-tighter mb-6 uppercase">Khám phá nhanh</Text>
            <View className="flex-row items-center justify-between py-4 border-b border-outline/10">
               <Text className="text-on-surface-variant font-bold text-sm">Gần vị trí của bạn</Text>
               <Feather name="chevron-right" size={16} color="#444" />
            </View>
            <View className="flex-row items-center justify-between py-4 border-b border-outline/10">
               <Text className="text-on-surface-variant font-bold text-sm">Đang giảm giá mạnh</Text>
               <Feather name="chevron-right" size={16} color="#444" />
            </View>
            <View className="flex-row items-center justify-between py-4">
               <Text className="text-on-surface-variant font-bold text-sm">Reviewers lựa chọn</Text>
               <Feather name="chevron-right" size={16} color="#444" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
