import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useToggleLikeMutation, useDeletePostMutation } from '@/features/posts/postApi';
import type { Post } from '@/features/posts/postApi';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const { user } = useAuth();
  const [toggleLike] = useToggleLikeMutation();
  const [deletePost] = useDeletePostMutation();
  const isOwner = user?.id === post.author.id;

  const handleLike = () => {
    void toggleLike(post.id);
  };

  return (
    <div className="bg-card hover:border-primary/20 rounded-lg border transition-colors">
      <div className="p-4">
        {/* Header */}
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
              </p>
            </div>
          </Link>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => {
                  void deletePost(post.id);
                }}
                className="text-muted-foreground hover:text-destructive rounded p-1"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <Link to={`/posts/${post.id}`} className="mt-3 block">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-[10px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4 border-t pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            {post.likeCount}
          </button>
          <Link
            to={`/posts/${post.id}`}
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-xs transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </Link>
        </div>
      </div>
    </div>
  );
}
