import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { addTimelog, listTimelogsForTask, listTimelogsForUser } from '../controllers/timelogs';

const router = Router();

router.post('/', authMiddleware, addTimelog); // body: { task_id, minutes, note }
router.get('/task/:taskId', authMiddleware, listTimelogsForTask);
router.get('/user/:userId', authMiddleware, listTimelogsForUser);

export default router;
