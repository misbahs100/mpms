import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createComment, listComments } from '../controllers/comments';

const router = Router();

router.post('/', authMiddleware, createComment); // body: { task_id, body, parent_id? }
router.get('/task/:taskId', authMiddleware, listComments);

export default router;
