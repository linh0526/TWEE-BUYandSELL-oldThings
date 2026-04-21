import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TopNavbar from '@/components/TopNavbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'package';
      case 'system': return 'info';
      case 'approval': return 'check-circle';
      default: return 'bell';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopNavbar title="THÔNG BÁO" />

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 80 }}>
        {!user && (
          <View className="flex-1 items-center justify-center py-20">
             <Feather name="bell-off" size={60} color="#CCC" />
             <Text className="text-gray-400 font-bold mt-4 uppercase text-center px-10">Vui lòng đăng nhập để xem thông báo</Text>
          </View>
        )}

        {user && loading && (
          <ActivityIndicator color="#FF7524" style={{ marginTop: 20 }} />
        )}

        {user && !loading && notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
             <Feather name="bell" size={60} color="#EEE" />
             <Text className="text-gray-300 font-bold mt-4 uppercase">Chưa có thông báo nào</Text>
          </View>
        )}
    
        {notifications.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            className={`p-6 rounded-2xl mb-4 flex-row items-start ${notif.is_read ? 'bg-surface-container/50 opacity-60' : 'bg-surface-container border border-secondary/10'}`}
          >
             <View className="bg-surface-container-high p-3 rounded-xl mr-4">
               <Feather name={getIcon(notif.type) as any} size={18} color="#FF7524" />
             </View>
             <View className="flex-1">
               <Text className={`text-primary font-black text-sm uppercase tracking-wider ${notif.is_read ? '' : 'text-secondary'}`}>{notif.title}</Text>
               <Text className="text-on-surface-variant text-xs mt-1 leading-5">{notif.content}</Text>
               <Text className="text-on-surface-variant/40 text-[9px] font-bold mt-2 uppercase tracking-widest">{formatTime(notif.created_at)}</Text>
             </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
