import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as notificationService from './notification.service.js';

function getNotifId(req: Request): string {
  const id = req.params.id;
  if (!id) throw new NotFoundError('Notification');
  return id;
}

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const pagination = parsePagination(req.query);
  const result = await notificationService.getNotifications(
    req.userId,
    pagination.page,
    pagination.limit,
  );
  sendSuccess(
    res,
    result.notifications,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  await notificationService.markNotificationRead(getNotifId(req), req.userId);
  sendSuccess(res, { message: 'Marked as read' });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  await notificationService.markAllRead(req.userId);
  sendSuccess(res, { message: 'All marked as read' });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const count = await notificationService.getUnreadCount(req.userId);
  sendSuccess(res, { count });
});
