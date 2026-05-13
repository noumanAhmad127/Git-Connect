import { api } from '@/store/api';
import type { PaginationMeta } from '@gitconnect/shared';

export interface UserSearchResult {
  type: 'user';
  id: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  skills?: string[];
  url: string;
  description?: string;
}

export interface PostSearchResult {
  type: 'post';
  id: string;
  content?: string;
  tags?: string[];
  url: string;
  description?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  createdAt?: string;
}

export type SearchResult = UserSearchResult | PostSearchResult;

export interface SearchParams {
  q: string;
  type?: 'all' | 'users' | 'posts';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  results: SearchResult[];
  meta: PaginationMeta;
}

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<SearchResults, SearchParams>({
      query: (params) => ({
        url: '/search',
        params: {
          q: params.q,
          type: params.type ?? 'all',
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        },
      }),
      providesTags: ['Search'],
      transformResponse: (response: {
        success: true;
        data: SearchResult[];
        meta: PaginationMeta;
      }) => ({
        results: response.data,
        meta: response.meta,
      }),
    }),
  }),
});

export const { useSearchQuery, useLazySearchQuery } = searchApi;
