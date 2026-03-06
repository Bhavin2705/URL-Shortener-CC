import { Router } from 'express';
import { protect } from '../middleware/auth';
import { shorten, redirect, list, remove } from '../controllers/urlController';

const router = Router();
router.post('/shorten', protect, shorten);
router.get('/links', protect, list);
router.delete('/links/:code', protect, remove);

export const redirectRouter = Router();
redirectRouter.get('/:code', redirect);

export default router;
