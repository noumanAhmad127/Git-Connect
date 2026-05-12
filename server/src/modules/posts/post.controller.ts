import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination.js';
import * as postService from './post.service.js';

function getPostId(req: Request): string {
  const id = req.params.id;
  if (!id) throw new NotFoundError('Post');
  return id;
}

function getCommentId(req: Request): string {
  const id = req.params.commentId;
  if (!id) throw new NotFoundError('Comment');
  return id;
}

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const post = await postService.createPost(req.userId, req.body);
  sendCreated(res, post);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPost(getPostId(req), req.userId);
  sendSuccess(res, post);
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const post = await postService.updatePost(getPostId(req), req.userId, req.body);
  sendSuccess(res, post);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  await postService.deletePost(getPostId(req), req.userId);
  sendSuccess(res, { message: 'Post deleted' });
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const pagination = parsePagination(req.query);
  const result = await postService.getFeed(req.userId, pagination.page, pagination.limit);
  sendSuccess(
    res,
    result.posts,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const { tags, sort, search, authorId } = req.query as Record<string, string | undefined>;

  const result = await postService.listPosts({
    ...pagination,
    tags,
    sort,
    search,
    authorId,
    currentUserId: req.userId,
  });

  sendSuccess(
    res,
    result.posts,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const result = await postService.toggleLike(getPostId(req), req.userId);
  sendSuccess(res, result);
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const result = await postService.getPostComments(
    getPostId(req),
    pagination.page,
    pagination.limit,
  );
  sendSuccess(
    res,
    result.comments,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const comment = await postService.createComment(getPostId(req), req.userId, req.body);
  sendCreated(res, comment);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  await postService.deleteComment(getCommentId(req), req.userId);
  sendSuccess(res, { message: 'Comment deleted' });
});
