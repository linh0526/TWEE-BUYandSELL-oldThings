import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://pwobpylsoyjjzhozdioy.supabase.co';
const supabaseKey = 'sb_publishable_LJp_guf4kvXeXEDfhnQzWw_xYM3jZf0';

export const supabase = createClient(
supabaseUrl,
supabaseKey,
{
auth: {
storage: Platform.OS === 'web' ? undefined : AsyncStorage,
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: false,
},
}
);