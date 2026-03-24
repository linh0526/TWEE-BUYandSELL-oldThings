import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TopNavbar from '@/components/TopNavbar';

export default function ProfileScreen() {
  const menuItems = [
    { icon: <Feather name="package" size={18} color="#FF7524" />, label: 'Tin đăng của tôi', count: 3 },
    { icon: <Feather name="heart" size={18} color="#FF7524" />, label: 'Tin đã lưu', count: 12 },
    { icon: <Feather name="message-square" size={18} color="#FF7524" />, label: 'Tin nhắn', count: 5 },
    { icon: <Feather name="clock" size={18} color="#FF7524" />, label: 'Lịch sử mua hàng', count: 0 },
    { icon: <Feather name="credit-card" size={18} color="#FF7524" />, label: 'Ví Twee', labelExtra: '0 VNĐ' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopNavbar />

      <ScrollView className="flex-1 p-6">
        {/* Profile Card */}
        <View className="items-center mb-10">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-surface-container-high border-2 border-outline items-center justify-center">
               <Text className="text-4xl font-black text-secondary">AT</Text>
            </View>
            <View className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-background"></View>
          </View>
          <Text className="text-3xl font-black text-primary mt-6 tracking-tighter uppercase">Admin Twee</Text>
          <Text className="text-on-surface-variant font-bold text-[11px] mt-2 uppercase tracking-widest">@admintwee • 4.9⭐ (12 lượt đánh giá)</Text>
          
          <TouchableOpacity className="mt-6 px-10 py-4 bg-surface-container rounded-full border border-outline">
            <Text className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-10">
           <View className="bg-surface-container-high flex-1 py-6 rounded-2xl mr-3 items-center">
             <Text className="text-2xl font-black text-primary">24</Text>
             <Text className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest mt-2">Lượt mua</Text>
           </View>
           <View className="bg-surface-container-high flex-1 py-6 rounded-2xl mr-3 items-center">
             <Text className="text-2xl font-black text-primary">8</Text>
             <Text className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest mt-2">Đang bán</Text>
           </View>
           <View className="bg-surface-container-high flex-1 py-6 rounded-2xl items-center">
             <Text className="text-2xl font-black text-primary">128</Text>
             <Text className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest mt-2">Followers</Text>
           </View>
        </View>

        {/* Menu Items */}
        <View className="bg-surface-container rounded-3xl overflow-hidden mb-12">
          {menuItems.map((item, i) => (
            <TouchableOpacity 
              key={item.label} 
              className="flex-row items-center justify-between p-6"
            >
              <View className="flex-row items-center">
                <View className="p-3 bg-surface rounded-xl mr-5">
                  {item.icon}
                </View>
                <Text className="text-primary font-bold text-sm uppercase tracking-wider">{item.label}</Text>
              </View>
              <View className="flex-row items-center">
                {item.count !== undefined && item.count > 0 && (
                  <View className="bg-secondary px-3 py-1 rounded-full mr-3">
                    <Text className="text-[#3C1300] font-black text-[10px]">{item.count}</Text>
                  </View>
                )}
                {item.labelExtra && (
                  <Text className="text-on-surface-variant font-bold text-[10px] mr-3 uppercase tracking-widest">{item.labelExtra}</Text>
                )}
                <Feather name="chevron-right" size={16} color="#444" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="flex-row items-center justify-center p-6 bg-surface-container-high rounded-full mb-32 border border-outline/10">
           <Feather name="log-out" size={18} color="#FF7524" />
           <Text className="text-primary font-black ml-3 uppercase tracking-[0.2em] text-xs">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
