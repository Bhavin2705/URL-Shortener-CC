import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import { adminOverview, listUsers, updateUserRole, setUserBlocked, adminAnalytics } from '../controllers/adminController';

const r = Router();
r.use(protect, adminOnly);

r.get('/overview', adminOverview);
r.get('/analytics', adminAnalytics);
r.get('/users', listUsers);
r.patch('/users/:id/role', updateUserRole);
r.patch('/users/:id/block', setUserBlocked);

export default r;
