import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading, refreshProfile } = useAuth();
  const [listingCount, setListingCount] = useState(0);
  const [buyingCount, setBuyingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'MUA' | 'BÁN'>('MUA');
  const [shopDescription, setShopDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.shop_description) {
      setShopDescription(profile.shop_description);
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      // Đếm số sản phẩm đang bán
      const { count: prodCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);
      setListingCount(prodCount || 0);

      // Đếm số đơn hàng đã mua
      const { count: bCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id);
      setBuyingCount(bCount || 0);
    } catch (error) {
      console.error('Lỗi lấy thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToOrders = (statusType?: string) => {
    const type = activeTab === 'MUA' ? 'buying' : 'selling';
    router.push({
      pathname: '/my-orders',
      params: { type, status: statusType }
    } as any);
  };

  const handleUpdateAvatar = async () => {
    Alert.alert(
      'Thay đổi ảnh đại điện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Chụp ảnh', onPress: () => pickImage(true) },
        { text: 'Chọn từ thư viện', onPress: () => pickImage(false) },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const fileName = `${user?.id}/avatar-${Date.now()}.jpg`;
      
      // Convert URI to Blob for Supabase Storage
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      
      if (refreshProfile) await refreshProfile(); 
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã cập nhật ảnh đại diện' });
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveShopInfo = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ shop_description: shopDescription })
        .eq('id', user.id);

      if (error) throw error;
      if (refreshProfile) await refreshProfile();
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã cập nhật thông tin shop' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
    } finally {
      setSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [user])
  );

  if (authLoading || (user && loading)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#FF7524" size="large" />
      </View>
    );
  }

  if (!user) return (
    <SafeAreaView className="flex-1 items-center justify-center p-10 bg-white">
      <Feather name="user-x" size={80} color="#CCC" />
      <TouchableOpacity 
        className="mt-10 bg-secondary w-full py-5 rounded-2xl items-center" 
        onPress={() => router.push('/login' as any)}
      >
        <Text className="text-white font-bold uppercase">Đăng nhập</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const displayName = profile?.display_name || profile?.full_name || user.email?.split('@')[0] || 'Người dùng Twee';
  const displayChar = (displayName?.[0] || 'U').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-10 mt-6">
          <TouchableOpacity 
            onPress={handleUpdateAvatar}
            disabled={uploading}
            className="w-24 h-24 rounded-full bg-orange-50 items-center justify-center border-2 border-primary/10 shadow-sm relative overflow-hidden"
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
            ) : (
              <Text className="text-4xl font-black text-primary">{displayChar}</Text>
            )}
            <View className="absolute inset-0 bg-black/10 items-center justify-center">
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Feather name="camera" size={20} color="white" style={{ opacity: 0.8 }} />
              )}
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-black mt-4 uppercase text-primary tracking-tighter">
            {displayName}
          </Text>
          <Text className="text-gray-400 font-bold text-xs">{user.email}</Text>
        </View>

        <View className="flex-row justify-around mb-10 bg-gray-50 p-6 rounded-3xl">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/my-orders', params: { type: 'selling' } } as any)}
            className="items-center"
          >
            <Text className="text-xl font-black text-primary">{listingCount}</Text>
            <Text className="text-gray-400 text-[9px] font-black uppercase">Đang bán</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/my-orders', params: { type: 'buying' } } as any)}
            className="items-center"
          >
            <Text className="text-xl font-black text-primary">{buyingCount}</Text>
            <Text className="text-gray-400 text-[9px] font-black uppercase">Đã mua</Text>
          </TouchableOpacity>
        </View>

        {/* MUA/BÁN Tabs */}
        <View className="mb-10">
          <View className="flex-row bg-gray-50/50 rounded-2xl overflow-hidden mb-4">
            <TouchableOpacity 
              onPress={() => setActiveTab('MUA')} 
              className={`flex-1 py-5 items-center ${activeTab === 'MUA' ? 'bg-white border-b-2 border-primary' : ''}`}
            >
              <Text className={`font-black uppercase text-xs tracking-widest ${activeTab === 'MUA' ? 'text-primary' : 'text-gray-300'}`}>Mua</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('BÁN')} 
              className={`flex-1 py-5 items-center ${activeTab === 'BÁN' ? 'bg-white border-b-2 border-secondary' : ''}`}
            >
              <Text className={`font-black uppercase text-xs tracking-widest ${activeTab === 'BÁN' ? 'text-secondary' : 'text-gray-300'}`}>Bán</Text>
            </TouchableOpacity>
          </View>

          <View className={`p-8 rounded-[32px] ${activeTab === 'MUA' ? 'bg-[#007AFF]' : 'bg-[#FF7524]'}`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white font-black text-sm uppercase">Đơn {activeTab === 'MUA' ? 'mua' : 'bán'} của tôi</Text>
              <TouchableOpacity
                onPress={() => navigateToOrders()}
                className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-[9px] font-black uppercase mr-1">Hiện tất cả</Text>
                <Feather name="chevron-right" size={10} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-around">
               <TouchableOpacity onPress={() => navigateToOrders('pending')} className="items-center">
                  <MaterialCommunityIcons name="wallet-outline" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Chờ thanh toán</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => navigateToOrders('paid')} className="items-center">
                  <MaterialCommunityIcons name="truck-delivery-outline" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Đang xử lý</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => navigateToOrders('shipped')} className="items-center">
                  <MaterialCommunityIcons name="package-variant" size={26} color="white" />
                  <Text className="text-white text-[8px] font-black mt-3 uppercase">Chờ nhận hàng</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mb-10 bg-gray-50/50 rounded-[32px] p-2">
          {[
            { icon: <Feather name="package" size={18} color="#FF7524" />, label: 'Tin đăng của tôi', count: listingCount, onPress: () => router.push({ pathname: '/my-orders', params: { type: 'selling' } } as any) },
            { icon: <Feather name="heart" size={18} color="#FF7524" />, label: 'Tin đã lưu', count: 0, onPress: () => {} },
            { icon: <Feather name="message-square" size={18} color="#FF7524" />, label: 'Tin nhắn', count: 0, onPress: () => {} },
            { icon: <Feather name="settings" size={18} color="#FF7524" />, label: 'Cài đặt tài khoản', onPress: () => {} },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              onPress={item.onPress}
              className={`flex-row items-center justify-between p-4 ${index !== 3 ? 'border-b border-white/50' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                  {item.icon}
                </View>
                <Text className="text-[11px] font-black uppercase text-primary tracking-tighter">{item.label}</Text>
              </View>
              <View className="flex-row items-center">
                {item.count !== undefined && item.count > 0 && (
                  <View className="bg-primary px-2 py-0.5 rounded-lg mr-2">
                    <Text className="text-[9px] font-black text-white">{item.count}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={14} color="#FF7524" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          className="bg-red-50 p-6 rounded-2xl flex-row justify-center items-center mb-10" 
          onPress={async () => { 
            await signOut(); 
            router.replace('/(tabs)'); 
          }}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text className="text-red-500 font-black ml-3 uppercase text-xs tracking-widest">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
