import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { updateProfileSchema } from '@gitconnect/shared';
import * as userController from './user.controller.js';

const router = Router();

router.get('/developers', userController.listDevelopers);
router.get('/developers/:username', userController.getProfile);
router.patch(
  '/developers/:username',
  authenticate,
  validate({ body: updateProfileSchema }),
  userController.updateProfile,
);
router.post('/developers/:username/follow', authenticate, userController.toggleFollow);
router.delete('/developers/:username/follow', authenticate, userController.toggleFollow);
router.get('/developers/:username/followers', userController.getFollowers);
router.get('/developers/:username/following', userController.getFollowing);

export default router;
