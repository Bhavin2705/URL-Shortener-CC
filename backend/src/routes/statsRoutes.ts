import { Router } from 'express';
import { protect } from '../middleware/auth';
import { stats } from '../controllers/statsController';

const r = Router();
r.get('/stats/:code', protect, stats);
export default r;
