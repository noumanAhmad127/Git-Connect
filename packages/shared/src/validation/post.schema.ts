import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(50000),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tags: z.string().optional(),
  sort: z.enum(['recent', 'popular']).default('recent'),
  search: z.string().max(200).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
