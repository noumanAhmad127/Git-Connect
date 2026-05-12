import { api } from '@/store/api';
import type { PaginationMeta } from '@gitconnect/shared';

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  location?: string;
  experienceYears?: number;
  availableForMentorship: boolean;
  availableForCollaboration: boolean;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  portfolio: {
    title: string;
    description?: string;
    url?: string;
    githubUrl?: string;
    screenshots: string[];
  }[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface UpdateProfileBody {
  name?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  experienceYears?: number;
  availableForMentorship?: boolean;
  availableForCollaboration?: boolean;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education?: PublicProfile['education'];
  experience?: PublicProfile['experience'];
  portfolio?: PublicProfile['portfolio'];
}

export interface DeveloperQuery {
  page?: number;
  limit?: number;
  skills?: string;
  location?: string;
  mentorship?: boolean;
  search?: string;
}

export interface DevelopersResult {
  users: PublicProfile[];
  meta: PaginationMeta;
}

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<PublicProfile, string>({
      query: (username) => `/developers/${username}`,
      providesTags: (_result, _error, username) => [{ type: 'User', id: username }],
      transformResponse: (response: { success: true; data: PublicProfile }) => response.data,
    }),

    updateProfile: builder.mutation<PublicProfile, { username: string; body: UpdateProfileBody }>({
      query: ({ username, body }) => ({ url: `/developers/${username}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { username }) => [{ type: 'User', id: username }],
      transformResponse: (response: { success: true; data: PublicProfile }) => response.data,
    }),

    listDevelopers: builder.query<DevelopersResult, DeveloperQuery>({
      query: (params) => ({
        url: '/developers',
        params,
      }),
      providesTags: ['Users'],
      transformResponse: (response: {
        success: true;
        data: PublicProfile[];
        meta: PaginationMeta;
      }) => ({
        users: response.data,
        meta: response.meta,
      }),
    }),

    toggleFollow: builder.mutation<{ isFollowing: boolean; followerCount: number }, string>({
      query: (username) => ({ url: `/developers/${username}/follow`, method: 'POST' }),
      invalidatesTags: (_result, _error, username) => [{ type: 'User', id: username }, 'Users'],
      transformResponse: (response: {
        success: true;
        data: { isFollowing: boolean; followerCount: number };
      }) => response.data,
    }),

    getFollowers: builder.query<PublicProfile[], { username: string; page?: number }>({
      query: ({ username, page }) => `/developers/${username}/followers?page=${String(page ?? 1)}`,
      transformResponse: (response: { success: true; data: PublicProfile[] }) => response.data,
    }),

    getFollowing: builder.query<PublicProfile[], { username: string; page?: number }>({
      query: ({ username, page }) => `/developers/${username}/following?page=${String(page ?? 1)}`,
      transformResponse: (response: { success: true; data: PublicProfile[] }) => response.data,
    }),

    uploadAvatar: builder.mutation<{ avatar: string }, FormData>({
      query: (formData) => ({
        url: '/uploads/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { success: true; data: { avatar: string } }) => response.data,
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useListDevelopersQuery,
  useToggleFollowMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useUploadAvatarMutation,
} = profileApi;
