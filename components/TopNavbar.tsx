import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TopNavbarProps {
  placeholder?: string;
}

export default function TopNavbar({ placeholder = 'Tìm kiếm...' }: TopNavbarProps) {
  return (
    <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
      <View className="flex-1 bg-surface-container-high h-10 rounded-full px-4 flex-row items-center mr-4">
        <Feather name="search" size={16} color="#FF7524" />
        <Text className="ml-2 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">{placeholder}</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity className="p-2">
          <Feather name="settings" size={20} color="#F9F9F9" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1">
          <Feather name="shopping-cart" size={20} color="#F9F9F9" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1">
          <Feather name="message-square" size={20} color="#F9F9F9" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
