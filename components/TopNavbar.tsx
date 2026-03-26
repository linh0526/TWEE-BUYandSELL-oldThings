import React from 'react';
import { View, Text, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TopNavbarProps {
  placeholder?: string;
  isHome?: boolean;
  isExplore?: boolean;
  title?: string;
  onBack?: () => void;
  hideIcons?: boolean;
}

export default function TopNavbar({ 
  placeholder = 'Tìm kiếm...', 
  isHome = false, 
  isExplore = false,
  title,
  onBack,
  hideIcons = false
}: TopNavbarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  const handleSearch = () => {
    if (query.trim()) {
      router.push({
        pathname: '/search',
        params: { q: query }
      });
    }
  };

  const handleToggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  };

  return (
    <View className="bg-white border-b border-black/5">
      {/* Top Row: Logo/Title and Actions */}
      <View className="px-6 pt-4 pb-2 min-h-[50px] justify-center">
        {isSearchExpanded ? (
          <View className="flex-row items-center bg-white h-10 rounded-full px-4 border border-black/10">
            <Feather name="search" size={16} color="#1A1A1A" />
            <TextInput 
              ref={inputRef}
              className="ml-3 flex-1 text-sm font-bold text-primary py-1"
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={false}
            />
            <TouchableOpacity 
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setIsSearchExpanded(false);
              }} 
              className="p-1"
            >
              <Feather name="x" size={18} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        ) : 
        (
          <View className="flex-row items-center justify-between">
            {!isHome ? (
            <View className="flex-1 flex-row items-center">
              <TouchableOpacity 
                onPress={onBack || (() => router.back())} 
                className="p-2 -ml-2"
              >
                <Feather name="arrow-left" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            ) :
            (
              <View className="flex-1 flex-row items-center">
              </View>
            )
          }
              

            {/* Center: TWEE for Home or Title for Others */}
            <View className="flex-2 items-center justify-center">
              {isHome ? (
                <Text className="text-2xl font-black tracking-tighter text-secondary">TWEE</Text>
              ) : (
                <Text 
                  className="text-sm font-black text-secondary uppercase tracking-widest text-center"
                  numberOfLines={1}
                >
                  {title || ''}
                </Text>
              )}
            </View>

            <View className="flex-row items-center justify-end flex-1">
              {(isExplore || !!onBack) && (
                <TouchableOpacity onPress={handleToggleSearch} className="p-2">
                  <Feather name="search" size={22} color="#1A1A1A" />
                </TouchableOpacity>
              )}
              {!hideIcons && (
                <>
                  <TouchableOpacity className="p-2 ml-1">
                    <Feather name="shopping-cart" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2 -mr-2 ml-1">
                    <Feather name="message-square" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Search Row: Only for Home when not expanded */}
      {isHome && !isSearchExpanded && (
        <View className="px-6 pb-4">
          <View className="flex-row items-center bg-white h-12 rounded-full px-5 border border-black/10">
            <Feather name="search" size={18} color="#1A1A1A" />
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


