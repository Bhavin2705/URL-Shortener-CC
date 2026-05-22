import { Router } from 'express';
import { protect } from '../middleware/auth';
import { shorten, redirect, list, remove, update } from '../controllers/urlController';

const router = Router();
router.post('/shorten', protect, shorten);
router.get('/links', protect, list);
router.patch('/links/:code', protect, update);
router.delete('/links/:code', protect, remove);

export const redirectRouter = Router();
redirectRouter.get('/:code', redirect);

export default router;
