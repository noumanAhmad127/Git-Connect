import { api } from '@/store/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  location?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { success: true; data: { user: AuthUser; accessToken: string } },
      LoginRequest
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    register: builder.mutation<
      {
        success: true;
        data: { user: AuthUser; tokens: { accessToken: string; refreshToken: string } };
      },
      RegisterRequest
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    logout: builder.mutation<{ success: true; data: { message: string } }, undefined>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    getMe: builder.query<AuthUser, undefined>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    verifyEmail: builder.mutation<{ success: true; data: { message: string } }, { token: string }>({
      query: ({ token }) => ({ url: `/auth/verify-email?token=${token}`, method: 'GET' }),
    }),

    forgotPassword: builder.mutation<
      { success: true; data: { message: string } },
      { email: string }
    >({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<
      { success: true; data: { message: string } },
      { token: string; password: string }
    >({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
