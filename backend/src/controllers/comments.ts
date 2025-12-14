import { Request, Response } from 'express';
import db from '../services/db';
import { z } from 'zod';

const Schema = z.object({
  task_id: z.string().uuid(),
  body: z.string().min(1),
  parent_id: z.string().uuid().optional().nullable()
});

export async function createComment(req: Request, res: Response) {
  const data = Schema.parse(req.body);
  const q = `INSERT INTO comments (task_id, user_id, parent_id, body) VALUES ($1,$2,$3,$4) RETURNING *`;
  const r = await db.query(q, [data.task_id, (req as any).user.id, data.parent_id || null, data.body]);
  res.status(201).json({ comment: r.rows[0] });
}

export async function listComments(req: Request, res: Response) {
  const { taskId } = req.params;
  const r = await db.query('SELECT c.*, u.name as author_name FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE task_id=$1 ORDER BY created_at ASC', [taskId]);
  res.json({ comments: r.rows });
}
