import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { parsePagination, createPaginationMeta } from '../../shared/utils/pagination.js';
import * as messagingService from './messaging.service.js';

function getConvId(req: Request): string {
  const id = req.params.conversationId;
  if (!id) throw new NotFoundError('Conversation');
  return id;
}

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const { receiverId, content } = req.body as { receiverId: string; content: string };
  const message = await messagingService.sendMessage(req.userId, receiverId, content);
  sendCreated(res, message);
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const conversations = await messagingService.getConversations(req.userId);
  sendSuccess(res, conversations);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const pagination = parsePagination(req.query);
  const result = await messagingService.getMessages(
    getConvId(req),
    req.userId,
    pagination.page,
    pagination.limit,
  );
  sendSuccess(
    res,
    result.messages,
    200,
    createPaginationMeta(result.total, pagination.page, pagination.limit),
  );
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  await messagingService.markAsRead(getConvId(req), req.userId);
  sendSuccess(res, { message: 'Marked as read' });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new UnauthorizedError();
  const count = await messagingService.getUnreadCount(req.userId);
  sendSuccess(res, { count });
});
