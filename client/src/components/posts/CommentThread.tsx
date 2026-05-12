import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '@/features/posts/postApi';
import type { Comment } from '@/features/posts/postApi';
import { useAuth } from '@/features/auth/useAuth';

interface Props {
  postId: string;
}

function CommentItem({
  comment,
  postId,
  onReply,
}: {
  comment: Comment;
  postId: string;
  onReply: (id: string) => void;
}) {
  const { user } = useAuth();
  const [deleteComment] = useDeleteCommentMutation();
  const isOwner = user?.id === comment.author.id;
  const canReply = comment.depth < 2;

  return (
    <div className={`border-muted border-l-2 pl-4 ${comment.depth > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-start justify-between">
        <Link
          to={`/developers/${comment.author.username}`}
          className="group flex items-center gap-2"
        >
          <div className="bg-muted h-6 w-6 overflow-hidden rounded-full">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-[8px] font-semibold">
                {comment.author.name.charAt(0)}
              </div>
            )}
          </div>
          <span className="group-hover:text-primary text-xs font-medium">
            {comment.author.name}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {canReply && (
            <button
              onClick={() => {
                onReply(comment.id);
              }}
              className="text-muted-foreground hover:text-primary text-[10px]"
            >
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => {
                void deleteComment({ postId, commentId: comment.id });
              }}
              className="text-muted-foreground hover:text-destructive text-[10px]"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-sm">{comment.content}</p>
      <p className="text-muted-foreground mt-0.5 text-[10px]">
        {new Date(comment.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default function CommentThread({ postId }: Props) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCommentsQuery({ postId, page });
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const comments = data?.comments ?? [];
  const meta = data?.meta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    try {
      await createComment({
        postId,
        content: content.trim(),
        parentId: replyTo ?? undefined,
      }).unwrap();
      setContent('');
      setReplyTo(null);
    } catch {
      /* handled */
    }
  };

  const topLevel = comments.filter((c) => !c.parent);
  const replies = (parentId: string) => comments.filter((c) => c.parent === parentId);

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-sm font-semibold">
        Comments {meta?.total ? `(${String(meta.total)})` : ''}
      </h3>

      {/* Comment form */}
      {user && (
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="mb-6"
        >
          {replyTo && (
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
              <span>Replying to comment</span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                }}
                className="text-primary hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
              className="border-input bg-background focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
            />
            <button
              type="submit"
              disabled={isPosting || !content.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {isPosting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="border-muted border-t-primary h-6 w-6 animate-spin rounded-full border-4" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} postId={postId} onReply={setReplyTo} />
              {replies(comment.id).map((reply) => (
                <CommentItem key={reply.id} comment={reply} postId={postId} onReply={setReplyTo} />
              ))}
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && page < meta.totalPages && (
        <button
          onClick={() => {
            setPage((p) => p + 1);
          }}
          className="text-primary mt-4 text-sm hover:underline"
        >
          Load more comments
        </button>
      )}
    </div>
  );
}
