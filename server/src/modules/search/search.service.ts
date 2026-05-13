import { User } from '../auth/user.model.js';
import { Post } from '../posts/post.model.js';
import type mongoose from 'mongoose';

interface LeanUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  skills: string[];
}

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  name?: string;
  username?: string;
  avatar?: string;
}

interface PopulatedPost extends Record<string, unknown> {
  _id: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  createdAt: Date;
  author: PopulatedAuthor;
}

export interface SearchResult {
  type: 'user' | 'post';
  id: string;
  title?: string;
  description?: string;
  url: string;
  matchedField?: string;
  // User-specific
  name?: string;
  username?: string;
  avatar?: string;
  headline?: string;
  skills?: string[];
  // Post-specific
  content?: string;
  tags?: string[];
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  createdAt?: string;
}

export async function searchAll(params: {
  q: string;
  page: number;
  limit: number;
}): Promise<{ results: SearchResult[]; total: number }> {
  const query = params.q.trim();
  const regexQuery = { $regex: query, $options: 'i' };
  const perType = Math.ceil(params.limit / 2);

  const [users, posts] = await Promise.all([
    User.find({
      $or: [
        { name: regexQuery },
        { username: regexQuery },
        { headline: regexQuery },
        { skills: { $in: [new RegExp(query, 'i')] } },
      ],
    })
      .select('name username avatar headline skills')
      .limit(perType)
      .lean(),
    Post.find({ content: regexQuery })
      .sort({ createdAt: -1 })
      .limit(perType)
      .populate('author', 'name username avatar')
      .lean(),
  ]);

  const results: SearchResult[] = [
    ...users.map((u) => {
      const user = u as unknown as LeanUser;
      return {
        type: 'user' as const,
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        headline: user.headline,
        skills: user.skills,
        url: `/developers/${user.username}`,
        description: user.headline ?? user.bio ?? undefined,
      };
    }),
    ...posts.map((p) => {
      const post = p as unknown as PopulatedPost;
      const author = post.author;
      const authorName = author.name ?? 'Unknown';
      const authorUsername = author.username ?? 'unknown';
      return {
        type: 'post' as const,
        id: post._id.toString(),
        content: post.content.slice(0, 200),
        tags: post.tags,
        url: `/posts/${post._id.toString()}`,
        description: post.content.slice(0, 200),
        authorName,
        authorUsername,
        authorAvatar: author.avatar,
        createdAt: post.createdAt.toISOString(),
      };
    }),
  ];

  return {
    results,
    total: results.length,
  };
}

export async function searchUsers(params: {
  q: string;
  page: number;
  limit: number;
}): Promise<{ results: SearchResult[]; total: number }> {
  const query = params.q.trim();
  const filter = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
      { headline: { $regex: query, $options: 'i' } },
      { skills: { $in: [new RegExp(query, 'i')] } },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name username avatar headline skills')
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    results: users.map((u) => {
      const user = u as unknown as LeanUser;
      return {
        type: 'user' as const,
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        headline: user.headline,
        skills: user.skills,
        url: `/developers/${user.username}`,
        description: user.headline ?? undefined,
      };
    }),
    total,
  };
}

export async function searchPosts(params: {
  q: string;
  page: number;
  limit: number;
  currentUserId?: string;
}): Promise<{ results: SearchResult[]; total: number }> {
  const query = params.q.trim();
  const filter = { content: { $regex: query, $options: 'i' } };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .populate('author', 'name username avatar')
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    results: posts.map((p) => {
      const post = p as unknown as PopulatedPost;
      const author = post.author;
      return {
        type: 'post' as const,
        id: post._id.toString(),
        content: post.content.slice(0, 200),
        tags: post.tags,
        url: `/posts/${post._id.toString()}`,
        description: post.content.slice(0, 200),
        authorName: author.name ?? 'Unknown',
        authorUsername: author.username ?? 'unknown',
        authorAvatar: author.avatar,
        createdAt: post.createdAt.toISOString(),
      };
    }),
    total,
  };
}
