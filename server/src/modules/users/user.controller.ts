import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination.js';
import * as userService from './user.service.js';

function getUsername(req: Request): string {
  const username = req.params.username;
  if (!username) {
    throw new NotFoundError('User');
  }
  return username;
}

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getProfile(getUsername(req), req.userId);
  sendSuccess(res, profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  const profile = await userService.updateProfile(req.userId, req.body);
  sendSuccess(res, profile);
});

export const listDevelopers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const { skills, location, minExperience, mentorship, search } = req.query as Record<
    string,
    string | undefined
  >;

  const result = await userService.listDevelopers({
    ...pagination,
    skills,
    location,
    minExperience: minExperience ? Number(minExperience) : undefined,
    mentorship: mentorship === 'true',
    search,
  });

  sendSuccess(
    res,
    result.users,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  const result = await userService.toggleFollow(req.userId, getUsername(req));
  sendSuccess(res, result);
});

export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const result = await userService.getFollowers(
    getUsername(req),
    pagination.page,
    pagination.limit,
  );
  sendSuccess(
    res,
    result.users,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const result = await userService.getFollowing(
    getUsername(req),
    pagination.page,
    pagination.limit,
  );
  sendSuccess(
    res,
    result.users,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});
