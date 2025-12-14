import { Request, Response } from 'express';
import db from '../services/db';
import { z } from 'zod';
import fs from 'fs';

const CreateTask = z.object({
  project_id: z.string().uuid(),
  sprint_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional(),
  estimate_hours: z.number().optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  status: z.enum(['todo','in_progress','review','done']).optional(),
  due_date: z.string().optional(),
  assignees: z.array(z.string().uuid()).optional(),
  subtasks: z.any().optional()
});

export async function createTask(req: Request, res: Response) {
  console.log("inside create task")
  const data = CreateTask.parse(req.body);
  const q = `INSERT INTO tasks (project_id, sprint_id, title, description, estimate_hours, priority, status, due_date, assignees, subtasks)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
  const vals = [
    data.project_id,
    data.sprint_id || null,
    data.title,
    data.description || null,
    data.estimate_hours || null,
    data.priority || 'medium',
    data.status || 'todo',
    data.due_date || null,
    data.assignees || [],
    data.subtasks || []
  ];
  const r = await db.query(q, vals);
  res.status(201).json({ task: r.rows[0] });
}

export async function listTasks(req: Request, res: Response) {
  // filters: project, sprint, assignee, status, priority
  const { project_id, sprint_id, assignee, status, priority } = req.query as any;
  const where: string[] = [];
  const vals: any[] = [];
  if (project_id) { vals.push(project_id); where.push(`project_id=$${vals.length}`); }
  if (sprint_id) { vals.push(sprint_id); where.push(`sprint_id=$${vals.length}`); }
  if (status) { vals.push(status); where.push(`status=$${vals.length}`); }
  if (priority) { vals.push(priority); where.push(`priority=$${vals.length}`); }
  if (assignee) { vals.push(assignee); where.push(`$${vals.length} = ANY(assignees)`); }
  let q = 'SELECT * FROM tasks';
  if (where.length) q += ' WHERE ' + where.join(' AND ');
  q += ' ORDER BY created_at DESC';
  const r = await db.query(q, vals);
  res.json({ tasks: r.rows });
}

export async function getTask(req: Request, res: Response) {
  console.log("inside getTask")
  const { id } = req.params;
  const r = await db.query('SELECT * FROM tasks WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Task not found' });
  const task = r.rows[0];
  const comments = (await db.query('SELECT c.*, u.name as author_name FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE task_id=$1 ORDER BY created_at ASC', [id])).rows;
  res.json({ task, comments });
}

export async function getTasksBySprint(req: Request, res: Response) {
  console.log("inside getTasksBySprint")
  const { id } = req.params;
  console.log(id)
  const r = await db.query('SELECT * FROM tasks WHERE sprint_id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Task not found' });
  
  const tasks = r.rows;
  console.log(tasks)
  // const comments = (await db.query('SELECT c.*, u.name as author_name FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE task_id=$1 ORDER BY created_at ASC', [id])).rows;
  res.json({ tasks });
}

export async function updateTask(req: Request, res: Response) {
  const { id } = req.params;
  // allow partial update
  const data = req.body;
  const allowed = ['title','description','estimate_hours','priority','status','due_date','assignees','sprint_id','attachments','subtasks'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  const sets = fields.map((f, i) => `${f}=$${i+2}`).join(', ');
  const vals = [id, ...fields.map(k => (data as any)[k])];
  const q = `UPDATE tasks SET ${sets} WHERE id=$1 RETURNING *`;
  const r = await db.query(q, vals);
  // add activity log entry
  try {
    const t = r.rows[0];
    await db.query('INSERT INTO activity_logs (project_id, task_id, user_id, action, meta) VALUES ($1,$2,$3,$4,$5)', [t.project_id, t.id, (req as any).user.id, 'task_update', JSON.stringify({ changed: fields })]);
  } catch (e) { console.error(e); }
  res.json({ task: r.rows[0] });
}

export async function uploadAttachments(req: Request, res: Response) {
  const { id } = req.params;
  if (!req.files || !(req.files as any).length) return res.status(400).json({ error: 'No files' });
  // append file paths to task.attachments
  const files = (req.files as Express.Multer.File[]).map(f => `/${process.env.UPLOAD_DIR || 'uploads'}/${f.filename}`);
  // read existing attachments
  const r = await db.query('SELECT attachments FROM tasks WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Task not found' });
  const existing = r.rows[0].attachments || [];
  const newArr = [...existing, ...files];
  await db.query('UPDATE tasks SET attachments=$1 WHERE id=$2', [newArr, id]);
  res.json({ attachments: newArr });
}

export async function approveTask(req: Request, res: Response) {
  const { id } = req.params;
  // set to done if currently review
  const r = await db.query('SELECT * FROM tasks WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Task not found' });
  const task = r.rows[0];
  if (task.status !== 'review') return res.status(400).json({ error: 'Task not in review' });
  await db.query('UPDATE tasks SET status=$1 WHERE id=$2', ['done', id]);
  await db.query('INSERT INTO activity_logs (project_id, task_id, user_id, action) VALUES ($1,$2,$3,$4)', [task.project_id, id, (req as any).user.id, 'task_approved']);
  res.json({ success: true });
}
