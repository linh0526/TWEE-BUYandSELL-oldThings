import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Header */}
      <View className="px-4 py-4 border-b border-black/5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="#FF7524" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-[#F5F5F5] rounded-2xl px-4 py-2 ml-2">
           <Feather name="search" size={18} color="#999" />
           <TextInput 
             className="ml-3 flex-1 text-primary py-1"
             placeholder="Tìm kiếm bằng từ khoá..."
             placeholderTextColor="#999"
             autoFocus
             value={searchQuery}
             onChangeText={setSearchQuery}
           />
           {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
               <Feather name="x" size={18} color="#999" />
             </TouchableOpacity>
           )}
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Gợi ý tìm kiếm</Text>
        
        {['MacBook Air M2', 'iPhone 15 Pro', 'iPad Mini 6', 'AirPods Pro 2'].map((item) => (
          <TouchableOpacity 
            key={item} 
            className="flex-row items-center py-4 border-b border-black/5"
            onPress={() => setSearchQuery(item)}
          >
            <Feather name="trending-up" size={16} color="#FF7524" className="mr-3" />
            <Text className="text-primary font-bold text-sm">{item}</Text>
          </TouchableOpacity>
        ))}

        <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-8">Lịch sử tìm kiếm</Text>
        {['Đồ điện tử cũ', 'Ghế gaming'].map((item) => (
          <TouchableOpacity 
            key={item} 
            className="flex-row items-center py-4 border-b border-black/5"
            onPress={() => setSearchQuery(item)}
          >
            <Feather name="clock" size={16} color="#999" className="mr-3" />
            <Text className="text-primary font-bold text-sm">{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
