import { api } from '@/store/api';
import type { PaginationMeta } from '@gitconnect/shared';

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: PostAuthor;
  content: string;
  parent?: string;
  depth: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CreatePostBody {
  content: string;
  tags?: string[];
}

export interface PostQuery {
  page?: number;
  limit?: number;
  tags?: string;
  sort?: 'recent' | 'popular';
  search?: string;
  authorId?: string;
}

export interface PostsResult {
  posts: Post[];
  meta: PaginationMeta;
}

export interface CommentsResult {
  comments: Comment[];
  meta: PaginationMeta;
}

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<PostsResult, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/feed', params }),
      providesTags: ['Feed'],
      transformResponse: (response: { success: true; data: Post[]; meta: PaginationMeta }) => ({
        posts: response.data,
        meta: response.meta,
      }),
    }),

    listPosts: builder.query<PostsResult, PostQuery>({
      query: (params) => ({ url: '/posts', params }),
      providesTags: ['Posts'],
      transformResponse: (response: { success: true; data: Post[]; meta: PaginationMeta }) => ({
        posts: response.data,
        meta: response.meta,
      }),
    }),

    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
      transformResponse: (response: { success: true; data: Post }) => response.data,
    }),

    createPost: builder.mutation<Post, CreatePostBody>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Feed', 'Posts'],
      transformResponse: (response: { success: true; data: Post }) => response.data,
    }),

    updatePost: builder.mutation<Post, { id: string; body: Partial<CreatePostBody> }>({
      query: ({ id, body }) => ({ url: `/posts/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }, 'Feed', 'Posts'],
      transformResponse: (response: { success: true; data: Post }) => response.data,
    }),

    deletePost: builder.mutation<{ success: true; data: { message: string } }, string>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Feed', 'Posts'],
    }),

    toggleLike: builder.mutation<{ isLiked: boolean; likeCount: number }, string>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }, 'Feed', 'Posts'],
      transformResponse: (response: {
        success: true;
        data: { isLiked: boolean; likeCount: number };
      }) => response.data,
    }),

    getComments: builder.query<CommentsResult, { postId: string; page?: number }>({
      query: ({ postId, page }) => ({ url: `/posts/${postId}/comments`, params: { page } }),
      providesTags: (_result, _error, { postId }) => [{ type: 'Comments', id: postId }],
      transformResponse: (response: { success: true; data: Comment[]; meta: PaginationMeta }) => ({
        comments: response.data,
        meta: response.meta,
      }),
    }),

    createComment: builder.mutation<
      Comment,
      { postId: string; content: string; parentId?: string }
    >({
      query: ({ postId, ...body }) => ({ url: `/posts/${postId}/comments`, method: 'POST', body }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comments', id: postId },
        { type: 'Post', id: postId },
        'Feed',
        'Posts',
      ],
      transformResponse: (response: { success: true; data: Comment }) => response.data,
    }),

    deleteComment: builder.mutation<
      { success: true; data: { message: string } },
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comments', id: postId },
        { type: 'Post', id: postId },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useListPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = postApi;
