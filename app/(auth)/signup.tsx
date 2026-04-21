import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

const SignupScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
          full_name: fullName,
          trust_score: 10
        },
      },
    });

    if (error) {
      Toast.show({ type: 'error', text1: 'Đăng ký thất bại', text2: error.message });
      setLoading(false);
    } else {
      Toast.show({ 
        type: 'success', 
        text1: 'Thành công', 
        text2: 'Tài khoản đã được tạo. Chào mừng bạn!' 
      });
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <TouchableOpacity 
            className="mt-4 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <View className="mt-8 mb-10">
            <Text className="text-4xl font-black text-primary tracking-tighter">Tham gia Twee</Text>
            <Text className="text-gray-500 mt-2 text-lg">Bắt đầu mua bán đồ cũ một cách tin cậy</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Họ và tên</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <Feather name="user" size={20} color="#FF7524" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <Feather name="mail" size={20} color="#FF7524" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="name@example.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Mật khẩu</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <Feather name="lock" size={20} color="#FF7524" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-10">
            <TouchableOpacity
              className={`bg-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 ${loading ? 'opacity-70' : ''}`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-black uppercase tracking-widest">Đăng ký tài khoản</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6 mb-10">
              <Text className="text-gray-500">Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-primary font-bold">Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
