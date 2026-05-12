export interface Comment {
  _id: string;
  author: string;
  post: string;
  parent?: string;
  content: string;
  likes: string[];
  depth: number;
  createdAt: string;
  updatedAt: string;
}
