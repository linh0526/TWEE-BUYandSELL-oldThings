import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/lib/supabase';
import TopNavbar from '@/components/TopNavbar';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'MUA' | 'BÁN'>('MUA');
  const [myProductsCount, setMyProductsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id);
        setMyProductsCount(count || 0);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#FF7524" /></View>;

  if (!profile) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-10">
      <Feather name="user-x" size={80} color="#CCC" />
      <Text className="text-xl font-black mt-6 uppercase">Chưa đăng nhập</Text>
      <TouchableOpacity className="mt-6 bg-secondary px-10 py-4 rounded-2xl" onPress={() => router.push('/login')}><Text className="text-white font-bold">ĐĂNG NHẬP</Text></TouchableOpacity>
    </SafeAreaView>
  );

  const navigateToOrders = () => {
    router.push({
      pathname: '/my-orders',
      params: { type: activeTab === 'MUA' ? 'buying' : 'selling' }
    });
  };

  const menuItems = [
    { icon: <Feather name="package" size={18} color="#FF7524" />, label: 'Tin đăng của tôi', count: myProductsCount, onPress: () => router.push('/my-products') },
    { icon: <Feather name="heart" size={18} color="#FF7524" />, label: 'Tin đã lưu', count: 0 },
    { icon: <Feather name="message-square" size={18} color="#FF7524" />, label: 'Tin nhắn', count: 0 },
    { icon: <Feather name="clock" size={18} color="#FF7524" />, label: 'Lịch sử mua hàng', count: 0, onPress: () => router.push({ pathname: '/my-orders', params: { type: 'buying' } }) },
    { icon: <Feather name="settings" size={18} color="#FF7524" />, label: 'Cài đặt tài khoản' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <TopNavbar title="HỒ SƠ" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center py-10">
          <View className="w-24 h-24 rounded-full bg-orange-50 border-2 border-primary/10 items-center justify-center">
             <Text className="text-4xl font-black text-primary">
               {profile.full_name?.substring(0, 2).toUpperCase() || 'TW'}
             </Text>
          </View>
          <Text className="text-2xl font-black text-primary mt-5 tracking-tighter uppercase">{profile.full_name || 'Người dùng Twee'}</Text>
          <View className="flex-row items-center mt-2">
            <Feather name="star" size={14} color="#FFD700" />
            <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest ml-1">
              {profile.trust_score} Điểm tin cậy • {profile.email}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between px-8 mb-8">
           <View className="items-center">
             <Text className="text-xl font-black text-primary">0</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Lượt mua</Text>
           </View>
           <View className="items-center">
             <Text className="text-xl font-black text-primary">{myProductsCount}</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Đang bán</Text>
           </View>
           <View className="items-center">
             <Text className="text-xl font-black text-primary">0</Text>
             <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Followers</Text>
           </View>
        </View>

        {/* Số dư & Điểm O2 */}
        <View className="flex-row justify-between items-center px-8 py-6 border-t border-gray-50">
           <View>
              <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Số dư của bạn</Text>
              <Text className="text-2xl font-black text-primary mt-1">0 <Text className="text-xs">đ</Text></Text>
           </View>
           <View className="items-end">
              <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Điểm O2</Text>
              <View className="flex-row items-center mt-1">
                 <MaterialCommunityIcons name="molecule" size={20} color="#00B4D8" />
                 <Text className="text-2xl font-black text-primary ml-1">0</Text>
              </View>
           </View>
        </View>

        {/* MUA / BÁN Tabs */}
        <View className="mb-10">
          <View className="flex-row bg-gray-50/50">
            <TouchableOpacity onPress={() => setActiveTab('MUA')} className={`flex-1 py-5 items-center ${activeTab === 'MUA' ? 'bg-white border-b-2 border-primary' : ''}`}>
              <Text className={`font-black uppercase text-xs tracking-widest ${activeTab === 'MUA' ? 'text-primary' : 'text-gray-300'}`}>Mua</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('BÁN')} className={`flex-1 py-5 items-center ${activeTab === 'BÁN' ? 'bg-white border-b-2 border-secondary' : ''}`}>
              <Text className={`font-black uppercase text-xs tracking-widest ${activeTab === 'BÁN' ? 'text-secondary' : 'text-gray-300'}`}>Bán</Text>
            </TouchableOpacity>
          </View>

          <View className={`p-8 ${activeTab === 'MUA' ? 'bg-[#007AFF]' : 'bg-[#FF7524]'}`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white font-black text-sm uppercase">Đơn {activeTab === 'MUA' ? 'mua' : 'bán'} của tôi</Text>
              <TouchableOpacity
                onPress={navigateToOrders}
                className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-[9px] font-black uppercase mr-1">Hiện tất cả</Text>
                <Feather name="chevron-right" size={10} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-around">
               <TouchableOpacity onPress={navigateToOrders} className="items-center">
                  <MaterialCommunityIcons name="wallet-outline" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Chờ thanh toán</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={navigateToOrders} className="items-center">
                  <MaterialCommunityIcons name="truck-delivery-outline" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Đang xử lý</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={navigateToOrders} className="items-center">
                  <MaterialCommunityIcons name="package-variant" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Chờ nhận hàng</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.onPress}
              className="flex-row items-center justify-between py-6 border-b border-gray-50 last:border-b-0"
            >
              <View className="flex-row items-center">
                <View className="p-3 bg-gray-50 rounded-xl mr-5">
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
                <Feather name="chevron-right" size={16} color="#EEE" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Đăng xuất */}
        <TouchableOpacity
          className="mx-6 mt-12 flex-row items-center justify-center p-6 bg-red-50 rounded-full mb-20 border border-red-100"
          onPress={signOut}
        >
           <Feather name="log-out" size={18} color="#EF4444" />
           <Text className="text-red-500 font-black ml-3 uppercase tracking-widest text-xs">Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
