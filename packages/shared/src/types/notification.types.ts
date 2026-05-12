export type NotificationType = 'follow' | 'like' | 'comment' | 'mention' | 'message';

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  actor: string;
  link: string;
  read: boolean;
  createdAt: string;
}
