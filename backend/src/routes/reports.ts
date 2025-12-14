import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import { projectReport } from "../controllers/reports";

const router = Router();

router.get(
  "/projects/:projectId",
  authMiddleware,
  requireRole("admin", "manager"),
  projectReport
);

export default router;
