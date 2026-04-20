import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, signOut, refreshProfile } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF7524" />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopNavbar title="HỒ SƠ" />
        <View className="flex-1 items-center justify-center px-10">
          <View className="p-10 bg-gray-50 rounded-full mb-8">
            <Feather name="user-x" size={80} color="#FF7524" />
          </View>
          <Text className="text-3xl font-black text-primary text-center tracking-tighter uppercase">Chưa đăng nhập</Text>
          <Text className="text-gray-500 text-center mt-3 text-lg">Đăng nhập để xem hồ sơ và quản lý tin đăng của bạn</Text>
          
          <TouchableOpacity 
            className="mt-10 bg-primary px-16 py-5 rounded-2xl shadow-lg shadow-primary/30"
            onPress={() => router.push('/login')}
          >
            <Text className="text-white font-black uppercase tracking-widest">Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: <Feather name="package" size={18} color="#FF7524" />, label: 'Tin đăng của tôi', count: 0 },
    { icon: <Feather name="heart" size={18} color="#FF7524" />, label: 'Tin đã lưu', count: 0 },
    { icon: <Feather name="message-square" size={18} color="#FF7524" />, label: 'Tin nhắn', count: 0 },
    { icon: <Feather name="clock" size={18} color="#FF7524" />, label: 'Lịch sử mua hàng', count: 0 },
    { icon: <Feather name="settings" size={18} color="#FF7524" />, label: 'Cài đặt tài khoản' },
    ...(profile.is_admin ? [{ icon: <Feather name="shield" size={18} color="#FF7524" />, label: 'Quản trị hệ thống', onPress: () => router.push('/(admin)/dashboard') }] : []),
  ];



  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <TopNavbar title="HỒ SƠ" />
      
      <ScrollView className="flex-1 p-6">
        {/* Profile Card */}
        <View className="items-center mb-10">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-orange-50 border-2 border-primary/20 items-center justify-center">
               <Text className="text-4xl font-black text-primary">
                 {profile.full_name?.substring(0, 2).toUpperCase() || 'TW'}
               </Text>
            </View>

          </View>
          <Text className="text-3xl font-black text-primary mt-6 tracking-tighter uppercase">{profile.full_name || 'Người dùng Twee'}</Text>
          <View className="flex-row items-center mt-2">
            <Feather name="star" size={14} color="#FFD700" />
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest ml-1">
              {profile.trust_score} Điểm tin cậy • {profile.email}
            </Text>
          </View>
          

        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-10">
           <View className="bg-gray-50 flex-1 py-6 rounded-2xl mr-3 items-center border border-gray-100">
             <Text className="text-2xl font-black text-primary">0</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">Lượt mua</Text>
           </View>
           <View className="bg-gray-50 flex-1 py-6 rounded-2xl mr-3 items-center border border-gray-100">
             <Text className="text-2xl font-black text-primary">0</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">Đang bán</Text>
           </View>
           <View className="bg-gray-50 flex-1 py-6 rounded-2xl items-center border border-gray-100">
             <Text className="text-2xl font-black text-primary">0</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">Followers</Text>
           </View>
        </View>

        {/* Menu Items */}
        <View className="bg-gray-50 rounded-3xl overflow-hidden mb-12 border border-gray-100">
          {menuItems.map((item, i) => (
            <TouchableOpacity 
              key={item.label} 
              onPress={item.onPress}
              className="flex-row items-center justify-between p-6 border-b border-gray-100 last:border-b-0"
            >
              <View className="flex-row items-center">
                <View className="p-3 bg-white shadow-sm rounded-xl mr-5">
                  {item.icon}
                </View>
                <Text className="text-gray-800 font-bold text-sm uppercase tracking-wider">{item.label}</Text>
              </View>
              <View className="flex-row items-center">
                {item.count !== undefined && item.count > 0 && (
                  <View className="bg-primary px-3 py-1 rounded-full mr-3">
                    <Text className="text-white font-black text-[10px]">{item.count}</Text>
                  </View>
                )}  
                <Feather name="chevron-right" size={16} color="#DDD" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          className="flex-row items-center justify-center p-6 bg-red-50 rounded-full mb-20 border border-red-100"
          onPress={signOut}
        >
           <Feather name="log-out" size={18} color="#EF4444" />
           <Text className="text-red-500 font-black ml-3 uppercase tracking-widest text-xs">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
