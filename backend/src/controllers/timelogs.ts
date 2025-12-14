import { Request, Response } from 'express';
import db from '../services/db';
import { z } from 'zod';

const Schema = z.object({
  task_id: z.string().uuid(),
  minutes: z.number().int().min(1),
  note: z.string().optional()
});

export async function addTimelog(req: Request, res: Response) {
  const data = Schema.parse(req.body);
  const q = `INSERT INTO timelogs (task_id, user_id, minutes, note) VALUES ($1,$2,$3,$4) RETURNING *`;
  const r = await db.query(q, [data.task_id, (req as any).user.id, data.minutes, data.note || null]);
  res.status(201).json({ timelog: r.rows[0] });
}

export async function listTimelogsForTask(req: Request, res: Response) {
  const { taskId } = req.params;
  const r = await db.query('SELECT t.*, u.name as user_name FROM timelogs t LEFT JOIN users u ON u.id=t.user_id WHERE task_id=$1 ORDER BY created_at DESC', [taskId]);
  res.json({ timelogs: r.rows });
}

export async function listTimelogsForUser(req: Request, res: Response) {
  const { userId } = req.params;
  const r = await db.query('SELECT * FROM timelogs WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
  res.json({ timelogs: r.rows });
}
