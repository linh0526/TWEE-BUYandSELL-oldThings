import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', title: 'Giảm giá 20%', description: 'MacBook Pro đang giảm sốc tại Twee.', time: '2 giờ trước', icon: 'tag' },
    { id: '2', title: 'Tin nhắn mới', description: 'Bạn có tin nhắn từ @nguyenvana.', time: '5 giờ trước', icon: 'message-square' },
    { id: '3', title: 'Cập nhật hệ thống', description: 'Hệ thống Curator v2.0 đã sẵn sàng.', time: '1 ngày trước', icon: 'info' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search Header will be consistent across all tabs */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
        <View className="flex-1 bg-surface-container-high h-10 rounded-full px-4 flex-row items-center mr-4">
          <Feather name="search" size={16} color="#FF7524" />
          <Text className="ml-2 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">Tìm kiếm...</Text>
        </View>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity><Feather name="settings" size={20} color="#F9F9F9" /></TouchableOpacity>
          <TouchableOpacity className="ml-4"><Feather name="shopping-cart" size={20} color="#F9F9F9" /></TouchableOpacity>
          <TouchableOpacity className="ml-4"><Feather name="message-square" size={20} color="#F9F9F9" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
    
        {notifications.map((notif) => (
          <TouchableOpacity key={notif.id} className="bg-surface-container p-6 rounded-2xl mb-4 flex-row items-start">
             <View className="bg-surface-container-high p-3 rounded-xl mr-4">
               <Feather name={notif.icon as any} size={18} color="#FF7524" />
             </View>
             <View className="flex-1">
               <Text className="text-primary font-black text-sm uppercase tracking-wider">{notif.title}</Text>
               <Text className="text-on-surface-variant text-xs mt-1 leading-5">{notif.description}</Text>
               <Text className="text-on-surface-variant/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{notif.time}</Text>
             </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
