export interface Post {
  _id: string;
  author: string;
  title: string;
  content: string;
  tags: string[];
  likes: string[];
  dislikes: string[];
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}
