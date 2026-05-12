import { Notification, type INotification } from './notification.model.js';
import type { NotificationType } from './notification.model.js';

interface NotificationResponse {
  id: string;
  type: NotificationType;
  actor: { id: string; name: string; username: string; avatar?: string };
  link: string;
  read: boolean;
  createdAt: string;
}

export async function createNotification(
  recipientId: string,
  type: NotificationType,
  actorId: string,
  link: string,
): Promise<INotification> {
  if (recipientId === actorId) {
    return null as any;
  }
  return Notification.create({ recipient: recipientId, type, actor: actorId, link });
}

export async function getNotifications(
  userId: string,
  page: number,
  limit: number,
): Promise<{ notifications: NotificationResponse[]; total: number; unreadCount: number }> {
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'name username avatar'),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return {
    notifications: notifications.map((n) => {
      const actor = (n as any).actor;
      return {
        id: n._id.toString(),
        type: n.type,
        actor: actor?.name
          ? {
              id: actor._id.toString(),
              name: actor.name,
              username: actor.username,
              avatar: actor.avatar,
            }
          : { id: n.actor.toString(), name: 'Unknown', username: 'unknown' },
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      };
    }),
    total,
    unreadCount,
  };
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await Notification.findOneAndUpdate({ _id: notificationId, recipient: userId }, { read: true });
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ recipient: userId, read: false });
}
