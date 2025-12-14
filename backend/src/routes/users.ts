import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  createUser,
  listUsers,
  updateUser
} from "../controllers/users";

const router = Router();

router.get("/", authMiddleware, requireRole("admin"), listUsers);
router.post("/", authMiddleware, requireRole("admin"), createUser);
router.put("/:id", authMiddleware, requireRole("admin"), updateUser);

export default router;
