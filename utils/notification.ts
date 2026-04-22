import { supabase } from '@/lib/supabase';

export type NotificationType = 'order' | 'system' | 'approval';

interface SendNotificationParams {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
}

export const sendNotification = async ({
  userId,
  title,
  content,
  type,
}: SendNotificationParams) => {
  try {
    if (!userId) return { error: 'UserId is required' };

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          content,
          type,
          is_read: false,
        },
      ]);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Lỗi khi gửi thông báo:', error.message);
    return { data: null, error };
  }
};
