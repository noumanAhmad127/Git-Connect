import mongoose, { Schema, type Document } from 'mongoose';

export interface IComment extends Document {
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true, maxlength: 5000 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    depth: { type: Number, default: 0, max: 2 },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parent: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
