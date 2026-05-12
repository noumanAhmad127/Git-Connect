import { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { corsOptions } from '../config/cors.js';
import { logger } from '../config/logger.js';

let io: Server | null = null;

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const jwt = token as string;
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1]!, 'base64url').toString());
      if (!payload.userId) {
        return next(new Error('Invalid token'));
      }
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info({ userId }, 'Socket connected');

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info({ userId }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
