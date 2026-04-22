import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://pwobpylsoyjjzhozdioy.supabase.co';
const supabaseAnonKey = 'sb_publishable_LJp_guf4kvXeXEDfhnQzWw_xYM3jZf0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Chỉ sử dụng AsyncStorage trên Mobile. Trên Web, Supabase sẽ tự dùng localStorage của trình duyệt.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});