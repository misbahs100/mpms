import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  createSprintForProject,
  listSprintsForProject
} from '../controllers/projects';

const router = Router();

router.get('/', authMiddleware, listProjects);
router.post('/', authMiddleware, requireRole('admin','manager'), createProject);
router.get('/:id', authMiddleware, getProject);
router.put('/:id', authMiddleware, requireRole('admin','manager'), updateProject);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProject);

// sprints under project
router.post('/:id/sprints', authMiddleware, requireRole('admin','manager'), createSprintForProject);
router.get('/:id/sprints', authMiddleware, listSprintsForProject);

export default router;
