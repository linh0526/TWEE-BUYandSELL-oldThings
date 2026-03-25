import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TopNavbarProps {
  placeholder?: string;
  isHome?: boolean;
  isExplore?: boolean;
  title?: string;
}

export default function TopNavbar({ 
  placeholder = 'Tìm kiếm...', 
  isHome = false, 
  isExplore = false,
  title
}: TopNavbarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const handleSearch = () => {
    if (query.trim()) {
      router.push({
        pathname: '/search',
        params: { q: query }
      });
    }
  };

  const showSearch = isHome || isExplore;

  return (
    <View className="bg-background border-b border-black/5">
      {/* Top Row: Logo/Title and Actions */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        {/* Left Side: Search for Explore or Empty for Home/Other */}
        <View className="flex-1">
          {isExplore && (
            <View className="flex-row items-center bg-surface-container-high h-9 rounded-full px-3 border border-black/5 max-w-[160px] -ml-2">
              <Feather name="search" size={14} color="#FF7524" />
              <TextInput 
                className="ml-2 flex-1 text-[10px] font-bold text-primary"
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
          )}
        </View>

        {/* Center: TWEE for Home or Title for Others */}
        <View className="flex-1 items-center justify-center">
          {isHome ? (
            <Text className="text-2xl font-black tracking-tighter text-secondary">TWEE</Text>
          ) : (
            <Text className="text-sm font-black text-secondary uppercase tracking-widest">{title || ''}</Text>
          )}
        </View>

        {/* Right Side: Icons */}
        <View className="flex-row items-center justify-end flex-1">
          <TouchableOpacity className="p-2 mr-1">
            <Feather name="shopping-cart" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 -mr-2">
            <Feather name="message-square" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Row: Only for Home */}
      {isHome && (
        <View className="px-6 pb-4">
          <View className="flex-row items-center bg-surface-container-high h-12 rounded-full px-5 border border-black/5">
            <Feather name="search" size={18} color="#FF7524" />
            <TextInput 
              className="ml-3 flex-1 text-xs font-bold text-primary py-2"
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>
      )}
    </View>
  );
}
