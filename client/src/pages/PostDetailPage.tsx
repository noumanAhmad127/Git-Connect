import { useParams, Link } from 'react-router-dom';
import {
  useGetPostQuery,
  useToggleLikeMutation,
  useDeletePostMutation,
} from '@/features/posts/postApi';
import { useAuth } from '@/features/auth/useAuth';
import { Heart, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react';
import CommentThread from '@/components/posts/CommentThread';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: post, isLoading } = useGetPostQuery(id ?? '', { skip: !id });
  const [toggleLike] = useToggleLikeMutation();
  const [deletePost] = useDeletePostMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">Post not found</h1>
          <p className="text-muted-foreground text-sm">This post may have been deleted.</p>
          <Link to="/feed" className="text-primary text-sm hover:underline">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.author.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <Link
        to="/feed"
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <article className="bg-card rounded-lg border">
        <div className="p-6">
          {/* Author */}
          <div className="flex items-start justify-between">
            <Link
              to={`/developers/${post.author.username}`}
              className="group flex items-center gap-3"
            >
              <div className="bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-full">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm font-semibold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="group-hover:text-primary text-sm font-medium">{post.author.name}</p>
                <p className="text-muted-foreground text-xs">
                  @{post.author.username} &middot; {new Date(post.createdAt).toLocaleDateString()}
                  {post.isEdited && <span className="ml-1 italic">(edited)</span>}
                </p>
              </div>
            </Link>

            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    void deletePost(post.id);
                  }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded p-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-4 border-t pt-4">
            <button
              onClick={() => {
                void toggleLike(post.id);
              }}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
            </button>
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MessageCircle className="h-5 w-5" />
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-6">
        <CommentThread postId={post.id} />
      </div>
    </div>
  );
}
