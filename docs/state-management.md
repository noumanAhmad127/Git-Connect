# State Management Architecture

## Redux Toolkit + RTK Query

### Store Structure

```
store/
├── index.ts           # configureStore, RootState, AppDispatch types
├── api.ts             # createApi base with fetchBaseQuery
└── hooks.ts           # Typed useAppDispatch, useAppSelector hooks
```

### RTK Query Base API

The base API (`store/api.ts`) configures:
- `fetchBaseQuery` pointing to the API server
- `credentials: 'include'` for cookie-based auth
- `prepareHeaders` to attach Authorization token from localStorage
- `tagTypes` for cache invalidation (User, Post, Comment, etc.)

### How Feature Modules Extend the API

Each feature creates its own API slice using `injectEndpoints()`:

```typescript
// features/posts/postsApi.ts
import { api } from '@/store/api';

export const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], { page: number }>({
      query: ({ page }) => `/posts?page=${page}`,
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation } = postsApi;
```

### Caching Strategy

- **Automatic caching**: RTK Query caches responses by default
- **Tag-based invalidation**: Mutations invalidate related tags to trigger refetches
- **Optimistic updates**: Like/follow actions update the cache immediately, then sync with server
- **Background refetch**: Data is refetched when window regains focus

### State vs Server Data

- **Server state** (API data): Managed entirely by RTK Query
- **UI state** (modals, sidebar, theme): Managed by Redux slices
- **Local state** (form inputs, dropdowns): Managed by React `useState`
