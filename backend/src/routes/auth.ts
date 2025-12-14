import { Router } from 'express';
import { register, login } from '../controllers/auth';

const router = Router();

/**
 * POST /api/auth/register
 * body: { name, email, password, role }
 * NOTE: For minimal flow, allow anyone to register if you want. In production restrict.
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', login);

export default router;
