import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import { createPostSchema, updatePostSchema, postQuerySchema } from '@gitconnect/shared';
import { createCommentSchema } from '@gitconnect/shared';
import * as postController from './post.controller.js';

const router = Router();

router.get('/feed', authenticate, postController.getFeed);

router.get('/posts', validate({ query: postQuerySchema }), postController.listPosts);
router.get('/posts/:id', postController.getPost);
router.post(
  '/posts',
  authenticate,
  validate({ body: createPostSchema }),
  postController.createPost,
);
router.patch(
  '/posts/:id',
  authenticate,
  validate({ body: updatePostSchema }),
  postController.updatePost,
);
router.delete('/posts/:id', authenticate, postController.deletePost);
router.post('/posts/:id/like', authenticate, postController.toggleLike);

router.get('/posts/:id/comments', postController.getComments);
router.post(
  '/posts/:id/comments',
  authenticate,
  validate({ body: createCommentSchema }),
  postController.createComment,
);
router.delete('/posts/:id/comments/:commentId', authenticate, postController.deleteComment);

export default router;
