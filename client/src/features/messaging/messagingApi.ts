import { api } from '@/store/api';
import type { PaginationMeta } from '@gitconnect/shared';

export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  participant: Participant;
  lastMessage?: { content: string; sender: string; createdAt: string };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: Participant;
  receiver: Participant;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessagesResult {
  messages: Message[];
  meta: PaginationMeta;
}

export const messagingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], undefined>({
      query: () => '/conversations',
      providesTags: ['Conversations'],
      transformResponse: (response: { success: true; data: Conversation[] }) => response.data,
    }),

    getMessages: builder.query<MessagesResult, { conversationId: string; page?: number }>({
      query: ({ conversationId, page }) => ({
        url: `/conversations/${conversationId}/messages`,
        params: { page },
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
      transformResponse: (response: { success: true; data: Message[]; meta: PaginationMeta }) => ({
        messages: response.data,
        meta: response.meta,
      }),
    }),

    sendMessage: builder.mutation<Message, { receiverId: string; content: string }>({
      query: (body) => ({ url: '/messages', method: 'POST', body }),
      invalidatesTags: ['Conversations'],
      transformResponse: (response: { success: true; data: Message }) => response.data,
    }),

    markConversationRead: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/read`, method: 'POST' }),
      invalidatesTags: ['Conversations'],
    }),

    getUnreadMessageCount: builder.query<{ count: number }, undefined>({
      query: () => '/messages/unread-count',
      providesTags: ['Conversations'],
      transformResponse: (response: { success: true; data: { count: number } }) => response.data,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetUnreadMessageCountQuery,
} = messagingApi;
