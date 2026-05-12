export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
  _id: string;
  reporter: string;
  targetModel: 'Post' | 'Comment' | 'User';
  target: string;
  reason: string;
  status: ReportStatus;
  handledBy?: string;
  createdAt: string;
}
