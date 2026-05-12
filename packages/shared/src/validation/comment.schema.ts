import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
