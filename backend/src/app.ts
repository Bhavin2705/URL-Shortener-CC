import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import urlRoutes, { redirectRouter } from './routes/urlRoutes';
import statsRoutes from './routes/statsRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const shortenLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const allowedOrigins = () => {
  if (process.env.NODE_ENV !== 'production') return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  return (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    callback(null, allowedOrigins().includes(origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);
app.use('/api/shorten', shortenLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);
app.use('/api', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', redirectRouter);

app.use(errorHandler);
export default app;
