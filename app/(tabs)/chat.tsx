import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  StyleSheet, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ChatScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    sellerId?: string;
    sellerName?: string;
    productId?: string;
    productTitle?: string
  }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const pId = params.productId && params.productId !== 'undefined' ? Number(params.productId) : null;
  const isChatting = !!params.sellerId;

  const fetchMessages = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase.from('messages').select('*');

      if (isChatting) {
        // Lấy tin nhắn giữa tôi và người kia
        query = query.or(`and(sender_id.eq.${user.id},seller_id.eq.${params.sellerId}),and(sender_id.eq.${params.sellerId},seller_id.eq.${user.id})`);
      } else {
        // Chế độ danh sách chung
        query = query.or(`sender_id.eq.${user.id},seller_id.eq.${user.id}`);
      }

      const { data, error } = await query.order('id', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Lỗi lấy tin nhắn:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;

        const isRelated = (newMessage.sender_id === user?.id && newMessage.seller_id === params.sellerId) ||
                          (newMessage.sender_id === params.sellerId && newMessage.seller_id === user?.id);

        if (isChatting && isRelated) {
             // Chỉ thêm nếu tin nhắn chưa tồn tại trong state (tránh lặp tin nhắn do vừa gửi vừa nhận realtime)
             setMessages((prev) => {
               if (prev.find(m => m.id === newMessage.id)) return prev;
               return [...prev, newMessage];
             });
        } else if (!isChatting) {
           fetchMessages();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [params.sellerId, user?.id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !params.sellerId || sending) return;

    try {
      setSending(true);
      const text = inputText.trim();
      setInputText(''); // Clear input ngay lập tức cho mượt

      const newMessage = {
        text: text,
        sender_id: user.id,
        seller_id: params.sellerId,
        product_id: pId,
        product_title: params.productTitle || 'Hội thoại Twee',
      };

      // Thêm .select().single() để lấy ngay dữ liệu vừa chèn vào DB
      const { data, error } = await supabase.from('messages').insert(newMessage).select().single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (error: any) {
      console.error('Lỗi gửi tin nhắn:', error.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: any) => {
    const isMine = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMine ? styles.myRow : styles.theirRow]}>
        {!isMine && (
           <View style={styles.avatarMini}>
              <Text style={styles.avatarText}>{(params.sellerName?.[0] || 'T').toUpperCase()}</Text>
           </View>
        )}
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatItem = ({ item }: any) => {
    const isMine = item.sender_id === user?.id;
    const otherId = isMine ? item.seller_id : item.sender_id;

    return (
      <TouchableOpacity
          style={styles.chatListItem}
          onPress={() => router.push({
              pathname: '/chat',
              params: {
                  sellerId: otherId,
                  productId: item.product_id,
                  productTitle: item.product_title,
                  sellerName: isMine ? 'Người mua' : 'Người bán'
              }
          } as any)}
      >
        <View style={styles.listAvatar}>
          <MaterialCommunityIcons name="chat-processing-outline" size={24} color="white" />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle} numberOfLines={1}>{item.product_title || 'Sản phẩm Twee'}</Text>
            <Text style={styles.listTime}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</Text>
          </View>
          <Text style={styles.lastMsg} numberOfLines={1}>{item.text}</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#DDD" />
      </TouchableOpacity>
    );
  };

  if (!isChatting) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainHeader}>
          <Text style={styles.headerTitle}>Hội thoại</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="more-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF7524" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderChatItem}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Feather name="message-square" size={64} color="#F0F0F0" />
                <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
              </View>
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.detailHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.sellerNameText} numberOfLines={1}>{params.sellerName || 'Người dùng Twee'}</Text>
          <View className="flex-row items-center">
             <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
             <Text style={styles.statusText}>Đang trực tuyến</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Feather name="phone" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {pId && (
        <View style={styles.productCard}>
            <View className="bg-orange-50 p-2 rounded-xl mr-3">
                <Feather name="package" size={20} color="#FF7524" />
            </View>
            <View className="flex-1">
                <Text style={styles.productLabel}>Đang hỏi về sản phẩm:</Text>
                <Text style={styles.productTitleDetail} numberOfLines={1}>{params.productTitle}</Text>
            </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.addBtn}>
             <Feather name="image" size={22} color="#999" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Gửi tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && { backgroundColor: '#F0F0F0' }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
               <ActivityIndicator size="small" color="#FF7524" />
            ) : (
               <Ionicons name="send" size={18} color={inputText.trim() ? "white" : "#CCC"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mainHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'white'
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', letterSpacing: -1 },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },

  detailHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 8 },
  sellerNameText: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  statusText: { fontSize: 11, color: '#22C55E', fontWeight: '700' },
  infoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },

  productCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8F9FA',
    marginHorizontal: 16, marginTop: 12, marginBottom: 8, borderRadius: 16,
    borderWidth: 1, borderColor: '#F0F0F0'
  },
  productLabel: { fontSize: 10, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  productTitleDetail: { fontSize: 13, fontWeight: '800', color: '#1A1A1A', marginTop: 2 },

  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  myRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirRow: { alignSelf: 'flex-start' },

  avatarMini: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#FF7524', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: 'white', fontSize: 12, fontWeight: '900' },

  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  myBubble: { backgroundColor: '#FF7524', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#F0F2F5', borderBottomLeftRadius: 4 },

  messageText: { fontSize: 15, lineHeight: 22 },
  myMessageText: { color: 'white', fontWeight: '500' },
  theirMessageText: { color: '#1A1A1A' },
  timeText: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end', fontWeight: '600' },
  myTimeText: { color: 'rgba(255,255,255,0.6)' },
  theirTimeText: { color: '#999' },

  inputArea: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16
  },
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  inputWrapper: { flex: 1, backgroundColor: '#F5F7FA', borderRadius: 20, paddingHorizontal: 16, marginHorizontal: 8 },
  input: { paddingVertical: 10, fontSize: 15, color: '#1A1A1A', maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, backgroundColor: '#FF7524', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center'
  },

  chatListItem: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderRadius: 20, marginBottom: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  listAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#FF7524', alignItems: 'center', justifyContent: 'center' },
  chatInfo: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chatTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  listTime: { fontSize: 11, color: '#BBB', fontWeight: '600' },
  lastMsg: { fontSize: 14, color: '#777' },
  emptyText: { textAlign: 'center', marginTop: 16, color: '#DDD', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 }
});