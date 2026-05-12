import { Post, type IPost } from './post.model.js';
import { Comment } from './comment.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { createNotification } from '../notifications/notification.service.js';
import { emitToUser } from '../../socket/index.js';

interface PostResponse {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

function toPostResponse(post: IPost, currentUserId?: string): PostResponse {
  const authorUser = (post as any).author;
  const author = authorUser?.name
    ? {
        id: authorUser._id.toString(),
        name: authorUser.name,
        username: authorUser.username,
        avatar: authorUser.avatar,
      }
    : { id: post.author.toString(), name: 'Unknown', username: 'unknown' };

  return {
    id: post._id.toString(),
    author,
    content: post.content,
    tags: post.tags,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    isLiked: currentUserId ? post.likes.some((l) => l.toString() === currentUserId) : false,
    isEdited: post.isEdited,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function createPost(
  authorId: string,
  data: { content: string; tags?: string[] },
): Promise<PostResponse> {
  const post = await Post.create({
    author: authorId,
    content: data.content,
    tags: data.tags ?? [],
  });
  const populated = await post.populate('author', 'name username avatar');
  return toPostResponse(populated, authorId);
}

export async function getPost(postId: string, currentUserId?: string): Promise<PostResponse> {
  const post = await Post.findById(postId).populate('author', 'name username avatar');
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  return toPostResponse(post, currentUserId);
}

export async function updatePost(
  postId: string,
  userId: string,
  data: { content?: string; tags?: string[] },
): Promise<PostResponse> {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  if (post.author.toString() !== userId) throw new AppError('Not authorized', 403, 'FORBIDDEN');

  if (data.content !== undefined) post.content = data.content;
  if (data.tags !== undefined) post.tags = data.tags;
  post.isEdited = true;

  await post.save();
  const populated = await post.populate('author', 'name username avatar');
  return toPostResponse(populated, userId);
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  if (post.author.toString() !== userId) throw new AppError('Not authorized', 403, 'FORBIDDEN');

  await Comment.deleteMany({ post: postId });
  await post.deleteOne();
}

export async function getFeed(
  userId: string,
  page: number,
  limit: number,
): Promise<{ posts: PostResponse[]; total: number }> {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const followedIds = [...user.following.map((f) => f.toString()), userId];
  const filter = { author: { $in: followedIds } };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name username avatar'),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts.map((p) => toPostResponse(p, userId)),
    total,
  };
}

export async function listPosts(params: {
  page: number;
  limit: number;
  tags?: string;
  sort?: string;
  search?: string;
  authorId?: string;
  currentUserId?: string;
}): Promise<{ posts: PostResponse[]; total: number }> {
  const filter: Record<string, unknown> = {};

  if (params.tags) {
    const tagArray = params.tags.split(',').map((t) => t.trim());
    filter.tags = { $in: tagArray };
  }
  if (params.search) {
    filter.content = { $regex: params.search, $options: 'i' };
  }
  if (params.authorId) {
    filter.author = params.authorId;
  }

  const sortOption: Record<string, 1 | -1> =
    params.sort === 'popular' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort(sortOption)
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .populate('author', 'name username avatar'),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts.map((p) => toPostResponse(p, params.currentUserId)),
    total,
  };
}

export async function toggleLike(
  postId: string,
  userId: string,
): Promise<{ isLiked: boolean; likeCount: number }> {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

  const isLiked = post.likes.some((l) => l.toString() === userId);

  if (isLiked) {
    post.likes = post.likes.filter((l) => l.toString() !== userId);
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    post.likes.push(userId as any);
    post.likeCount += 1;
    const notif = await createNotification(
      post.author.toString(),
      'like',
      userId,
      `/posts/${postId}`,
    );
    if (notif) emitToUser(post.author.toString(), 'notification', notif);
  }

  await post.save();
  return { isLiked: !isLiked, likeCount: post.likeCount };
}

export async function getPostComments(
  postId: string,
  page: number,
  limit: number,
): Promise<{
  comments: Array<{
    id: string;
    author: { id: string; name: string; username: string; avatar?: string };
    content: string;
    parent?: string;
    depth: number;
    isLiked: boolean;
    createdAt: string;
  }>;
  total: number;
}> {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

  const [comments, total] = await Promise.all([
    Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name username avatar'),
    Comment.countDocuments({ post: postId }),
  ]);

  return {
    comments: comments.map((c) => ({
      id: c._id.toString(),
      author: (c as any).author?.name
        ? {
            id: c.author.toString(),
            name: (c as any).author.name,
            username: (c as any).author.username,
            avatar: (c as any).author.avatar,
          }
        : { id: c.author.toString(), name: 'Unknown', username: 'unknown' },
      content: c.content,
      parent: c.parent?.toString(),
      depth: c.depth,
      isLiked: false,
      createdAt: c.createdAt.toISOString(),
    })),
    total,
  };
}

export async function createComment(
  postId: string,
  authorId: string,
  data: { content: string; parentId?: string },
): Promise<{
  id: string;
  author: { id: string; name: string; username: string; avatar?: string };
  content: string;
  parent?: string;
  depth: number;
  createdAt: string;
}> {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');

  let depth = 0;
  if (data.parentId) {
    const parent = await Comment.findById(data.parentId);
    if (!parent || parent.post.toString() !== postId) {
      throw new AppError('Parent comment not found', 404, 'PARENT_NOT_FOUND');
    }
    depth = parent.depth + 1;
    if (depth > 2) throw new AppError('Maximum nesting depth (2) reached', 400, 'NESTING_LIMIT');
  }

  const comment = await Comment.create({
    author: authorId,
    post: postId,
    parent: data.parentId ?? null,
    content: data.content,
    depth,
  });

  post.commentCount += 1;
  await post.save();

  const notif = await createNotification(
    post.author.toString(),
    'comment',
    authorId,
    `/posts/${postId}`,
  );
  if (notif) emitToUser(post.author.toString(), 'notification', notif);

  const populated = await comment.populate('author', 'name username avatar');
  return {
    id: comment._id.toString(),
    author: (populated as any).author?.name
      ? {
          id: comment.author.toString(),
          name: (populated as any).author.name,
          username: (populated as any).author.username,
          avatar: (populated as any).author.avatar,
        }
      : { id: comment.author.toString(), name: 'Unknown', username: 'unknown' },
    content: comment.content,
    parent: comment.parent?.toString(),
    depth: comment.depth,
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  if (comment.author.toString() !== userId) throw new AppError('Not authorized', 403, 'FORBIDDEN');

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  await Comment.deleteMany({ parent: commentId });
  await comment.deleteOne();
}
