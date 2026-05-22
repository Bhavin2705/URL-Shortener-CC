import { Router } from 'express';
import { register, login, logout, me, updateSettings, deleteAccount } from '../controllers/authController';
import { protect } from '../middleware/auth';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.post('/logout', logout);
r.get('/me', protect, me);
r.patch('/settings', protect, updateSettings);
r.delete('/account', protect, deleteAccount);
export default r;
