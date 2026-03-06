import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { protect } from '../middleware/auth';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.post('/logout', logout);
r.get('/me', protect, me);
export default r;
