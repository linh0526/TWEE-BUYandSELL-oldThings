import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id);
      setListingCount(count || 0);
    }
    setLoading(false);
  };

  if (loading) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator color="#FF7524" size="large" /></View>;

  if (!user) return (
    <SafeAreaView className="flex-1 items-center justify-center p-10 bg-white">
      <Feather name="user-x" size={80} color="#CCC" />
      <TouchableOpacity className="mt-10 bg-secondary w-full py-5 rounded-2xl items-center" onPress={() => router.push('/login' as any)}>
        <Text className="text-white font-bold uppercase">Đăng nhập</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-10 mt-6">
          <View className="w-24 h-24 rounded-full bg-orange-50 items-center justify-center border-2 border-primary/10 shadow-sm">
            <Text className="text-4xl font-black text-primary">{user.email?.[0].toUpperCase()}</Text>
          </View>
          <Text className="text-2xl font-black mt-4 uppercase text-primary tracking-tighter">{user.email?.split('@')[0]}</Text>
          <Text className="text-gray-400 font-bold text-xs">{user.email}</Text>
        </View>

        <View className="flex-row justify-around mb-10 bg-gray-50 p-6 rounded-3xl">
          <View className="items-center"><Text className="text-xl font-black text-primary">{listingCount}</Text><Text className="text-gray-400 text-[9px] font-black uppercase">Đang bán</Text></View>
          <View className="items-center"><Text className="text-xl font-black text-primary">0</Text><Text className="text-gray-400 text-[9px] font-black uppercase">Đã mua</Text></View>
        </View>

        <TouchableOpacity className="bg-red-50 p-6 rounded-2xl flex-row justify-center items-center" onPress={async () => { await supabase.auth.signOut(); router.replace('/(tabs)'); }}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text className="text-red-500 font-black ml-3 uppercase text-xs tracking-widest">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}