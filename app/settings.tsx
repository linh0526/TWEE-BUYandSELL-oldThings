import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setFullName(profile.full_name || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          full_name: fullName,
          address: address, // Đổi từ location sang address vì DB không có cột location
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      if (refreshProfile) await refreshProfile();
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã cập nhật thông tin tài khoản'
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-black uppercase tracking-tighter text-primary">Cài đặt tài khoản</Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Thông tin cơ bản</Text>

          <View className="mb-6">
            <Text className="text-[10px] font-black text-primary uppercase mb-2 ml-1">Email (Không thể thay đổi)</Text>
            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Text className="text-gray-400 font-bold text-sm">{user?.email}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-[10px] font-black text-primary uppercase mb-2 ml-1">Tên hiển thị</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nhập tên hiển thị..."
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-sm text-primary"
            />
          </View>

          <View className="mb-6">
            <Text className="text-[10px] font-black text-primary uppercase mb-2 ml-1">Họ và tên</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên..."
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-sm text-primary"
            />
          </View>

          <View className="mb-6">
            <Text className="text-[10px] font-black text-primary uppercase mb-2 ml-1">Khu vực / Địa chỉ</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Ví dụ: Quận 1, TP. HCM..."
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-sm text-primary"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={loading}
          className="bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-orange-200 mb-10"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black uppercase text-xs tracking-widest">Lưu thay đổi</Text>
          )}
        </TouchableOpacity>

        <View className="border-t border-gray-50 pt-8 mb-20">
          <Text className="text-[10px] font-black text-red-400 mb-4 uppercase tracking-[0.2em]">Khu vực nguy hiểm</Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Tính năng đang phát triển", "Vui lòng liên hệ quản trị viên để yêu cầu xóa tài khoản.")}
            className="flex-row items-center p-4 bg-red-50 rounded-2xl"
          >
            <Feather name="trash-2" size={18} color="#EF4444" />
            <Text className="text-red-500 font-black ml-3 uppercase text-[10px]">Yêu cầu xóa tài khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
