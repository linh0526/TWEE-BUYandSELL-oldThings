import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { VIETNAM_PROVINCES } from '@/constants/locations';

interface TopNavbarProps {
  placeholder?: string;
  isHome?: boolean;
  isExplore?: boolean;
  title?: string;
  onBack?: () => void;
  hideIcons?: boolean;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
}

export default function TopNavbar({ 
  placeholder = 'Tìm kiếm...', 
  isHome = false, 
  isExplore = false,
  title,
  onBack,
  hideIcons = false,
  selectedLocation,
  onLocationChange
}: TopNavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

    const { cartItems } = useCart();

  const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);

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
                <TouchableOpacity 
                  onPress={() => setIsLocationModalVisible(true)}
                  className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl"
                >
                  <Feather name="map-pin" size={14} color="#FF7524" />
                  <Text className="ml-1.5 text-[10px] font-black text-primary uppercase" numberOfLines={1} style={{ maxWidth: 80 }}>
                    {selectedLocation || 'Vị trí'}
                  </Text>
                  <Feather name="chevron-down" size={12} color="#999" className="ml-1" />
                </TouchableOpacity>
              </View>
            )
          }

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
                  <TouchableOpacity className="p-2 ml-1" onPress={() => router.push('/cart')}>
                    <View>
                      <Feather name="shopping-cart" size={20} color="#1A1A1A" />
                        {totalItems > 0 && (
                          <View style={{
                          position: 'absolute',
                          right: -8,
                          top: -8,
                          backgroundColor: '#FF7524',
                          borderRadius: 9,
                          minWidth: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1.5,
                          borderColor: 'white'
                        }}>
                          <Text style={{
                            color: 'white',
                            fontSize: 9,
                            fontWeight: 'bold',
                            paddingHorizontal: 2
                          }}>
                            {totalItems > 9 ? '9+' : totalItems}
                          </Text>
                        </View>
                      )}
                    </View>
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

      {/* Location Selection Modal */}
      <Modal visible={isLocationModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] h-[70%]">
            <View className="p-6 flex-1">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-black uppercase tracking-widest text-primary">Chọn Khu Vực</Text>
                <TouchableOpacity onPress={() => setIsLocationModalVisible(false)} className="p-2">
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity 
                   onPress={() => {
                     onLocationChange?.('');
                     setIsLocationModalVisible(false);
                   }}
                   className={`p-4 rounded-2xl mb-2 flex-row justify-between items-center ${!selectedLocation ? 'bg-secondary/10 border border-secondary' : 'bg-gray-50'}`}
                >
                  <Text className={`font-black text-xs uppercase ${!selectedLocation ? 'text-secondary' : 'text-primary'}`}>
                    Toàn quốc
                  </Text>
                  {!selectedLocation && <Feather name="check" size={16} color="#FF7524" />}
                </TouchableOpacity>

                <View className="flex-row flex-wrap">
                  {VIETNAM_PROVINCES.map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => { 
                        onLocationChange?.(p); 
                        setIsLocationModalVisible(false); 
                      }} 
                      className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${selectedLocation === p ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <Text className={`text-xs font-bold ${selectedLocation === p ? 'text-white' : 'text-primary'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

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
