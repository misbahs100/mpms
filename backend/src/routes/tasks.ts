import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createTask,
  updateTask,
  getTask,
  listTasks,
  uploadAttachments,
  approveTask,
  getTasksBySprint
} from '../controllers/tasks';

const router = Router();

// file upload setup
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

router.get('/sprints/:id', authMiddleware, getTasksBySprint);
router.get('/:id', authMiddleware, getTask);
router.get('/', authMiddleware, listTasks);
router.post('/', authMiddleware, requireRole('admin','manager'), createTask);

router.put('/:id', authMiddleware, updateTask);

// upload attachments for a task
router.post('/:id/attachments', authMiddleware, upload.array('files', 6), uploadAttachments);

// manager approves task from 'review' -> 'done'
router.post('/:id/approve', authMiddleware, requireRole('admin','manager'), approveTask);

export default router;
