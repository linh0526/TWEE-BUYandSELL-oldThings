import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FLAT_CATEGORIES } from '@/constants/data_cate'; 
import { getRootIds, getChildrenIds } from '@/utils/CategoryHelper';

export default function AdminDashboard() {
  const router = useRouter();

  // Lấy danh sách ID cấp 1 để hiển thị
  const rootIds = React.useMemo(() => getRootIds(), []);

  const stats = [
    { label: 'Doanh thu', value: '12.4M', icon: 'trending-up', color: '#10B981' },
    { label: 'Tin đăng', value: '245', icon: 'package', color: '#FF7524' },
    { label: 'Người dùng', value: '1.2k', icon: 'users', color: '#3B82F6' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-black/5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="ml-2 text-xl font-black text-primary tracking-tighter">ADMIN PANEL</Text>
        </View>
        <TouchableOpacity className="p-2 bg-secondary/10 rounded-full shadow-sm">
          <Feather name="bell" size={20} color="#FF7524" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row px-4 py-6">
          {stats.map((stat, i) => (
            <View key={i} className="flex-1 bg-white p-4 rounded-3xl border border-black/5 mx-2 shadow-sm">
              <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{stat.label}</Text>
              <Text className="text-xl font-black text-primary mt-1">{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Categories Section - Dùng FLAT_CATEGORIES */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-black text-secondary uppercase tracking-widest">QUẢN LÝ DANH MỤC</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-[10px] font-bold text-primary/40 uppercase">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-sm">
            {rootIds.slice(0, 5).map((id, i) => {
              const cat = (FLAT_CATEGORIES as any)[id];
              const subCount = getChildrenIds(id).length; // Đếm số con từ helper

              return (
                <TouchableOpacity 
                  key={id} 
                  className={`flex-row items-center justify-between p-5 ${i !== 4 ? 'border-b border-black/5' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl overflow-hidden bg-black/5 border border-black/5">
                      <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="ml-4">
                      <Text className="text-sm font-bold text-primary uppercase tracking-tight">{cat.name}</Text>
                      <Text className="text-[10px] font-bold text-primary/40 mt-0.5">{subCount} danh mục con</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-green-100 px-2 py-1 rounded-md mr-3">
                      <Text className="text-[8px] font-bold text-green-700 uppercase">Hoạt động</Text>
                    </View>
                    <Feather name="edit-3" size={14} color="#DDD" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-12">
          <Text className="text-sm font-black text-secondary uppercase tracking-widest mb-4">THAO TÁC NHANH</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { label: 'Thêm SP', icon: 'plus-circle', path: '/post' },
              { label: 'Duyệt tin', icon: 'check-circle', path: '/admin/approve' },
              { label: 'Báo cáo', icon: 'pie-chart', path: '/admin/reports' },
              { label: 'Hỗ trợ', icon: 'help-circle', path: '/support' },
            ].map((action, i) => (
              <TouchableOpacity 
                key={i}
                onPress={() => action.path && router.push(action.path as any)}
                className="w-[48%] bg-primary p-6 rounded-[28px] mb-4 flex-row items-center shadow-sm active:opacity-80"
              >
                <Feather name={action.icon as any} size={18} color="white" />
                <Text className="ml-3 text-[11px] font-bold text-white uppercase tracking-wider">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}