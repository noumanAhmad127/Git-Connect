import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination.js';
import * as searchService from './search.service.js';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const type = (req.query.type as string) || 'all';
  const pagination = parsePagination(req.query);

  if (!q.trim()) {
    sendSuccess(res, [], 200, createPaginationMeta(0, pagination.page, pagination.limit));
    return;
  }

  if (type === 'users') {
    const result = await searchService.searchUsers({ q, ...pagination });
    sendSuccess(
      res,
      result.results,
      200,
      createPaginationMeta(result.total, pagination.page, pagination.limit),
    );
  } else if (type === 'posts') {
    const result = await searchService.searchPosts({ q, ...pagination, currentUserId: req.userId });
    sendSuccess(
      res,
      result.results,
      200,
      createPaginationMeta(result.total, pagination.page, pagination.limit),
    );
  } else {
    const result = await searchService.searchAll({ q, ...pagination });
    sendSuccess(
      res,
      result.results,
      200,
      createPaginationMeta(result.total, pagination.page, pagination.limit),
    );
  }
});
