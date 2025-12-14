import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import reportRoutes from './routes/reports';
import commentRoutes from './routes/comments';
import timelogRoutes from './routes/timelogs';

dotenv.config();

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://mpms-irax.onrender.com', 'https://mpms-sepia.vercel.app'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// serve uploads statically (dev)
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timelogs', timelogRoutes);
app.use('/api/reports', reportRoutes);

// error handler
app.use(errorHandler);

export default app;
