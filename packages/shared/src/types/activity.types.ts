export type ActivityType = 'follow' | 'post' | 'comment' | 'like' | 'mentorship_request';

export interface Activity {
  _id: string;
  actor: string;
  type: ActivityType;
  targetModel: 'User' | 'Post' | 'Comment';
  target: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
