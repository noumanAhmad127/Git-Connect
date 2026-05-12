import { useState } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useGetFeedQuery } from '@/features/posts/postApi';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/posts/PostForm';

function FeedContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetFeedQuery({ page, limit: 20 });

  const posts = data?.posts ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="text-muted-foreground mt-1 text-sm">Posts from developers you follow</p>
      </div>

      {/* Post form */}
      <div className="mb-6">
        <PostForm
          onSuccess={() => {
            setPage(1);
          }}
        />
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">
            Your feed is empty. Follow developers to see their posts here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page <= 1 || isFetching}
                className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => {
                  setPage((p) => p + 1);
                }}
                disabled={page >= meta.totalPages || isFetching}
                className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}
