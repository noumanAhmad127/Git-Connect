import { api } from '@/store/api';
import type { PaginationMeta } from '@gitconnect/shared';

export interface NotificationItem {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'message';
  actor: { id: string; name: string; username: string; avatar?: string };
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResult {
  notifications: NotificationItem[];
  meta: PaginationMeta;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResult, { page?: number }>({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
      transformResponse: (response: {
        success: true;
        data: NotificationItem[];
        meta: PaginationMeta;
      }) => ({
        notifications: response.data,
        meta: response.meta,
      }),
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsRead: builder.mutation<void, undefined>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),

    getUnreadNotificationCount: builder.query<{ count: number }, undefined>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
      transformResponse: (response: { success: true; data: { count: number } }) => response.data,
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetUnreadNotificationCountQuery,
} = notificationApi;
