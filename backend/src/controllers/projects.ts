import { Request, Response } from 'express';
import db from '../services/db';
import { z } from 'zod';

// validations
const CreateProject = z.object({
  title: z.string().min(3),
  client: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().optional(),
  status: z.enum(['planned','active','completed','archived']).optional(),
  thumbnail: z.string().optional()
});

export async function createProject(req: Request, res: Response) {
  const data = CreateProject.parse(req.body);
  const q = `INSERT INTO projects (title, client, description, start_date, end_date, budget, status, thumbnail, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
  const r = await db.query(q, [data.title, data.client, data.description, data.start_date, data.end_date, data.budget, data.status || 'planned', data.thumbnail || null, (req as any).user.id]);
  res.status(201).json({ project: r.rows[0] });
}

export async function listProjects(req: Request, res: Response) {
  // filters: status, client, search
  const { status, client, q: search } = req.query as any;
  let base = `SELECT p.*, 
    COALESCE(done.done_count,0) as done_tasks, COALESCE(total.total_count,0) as total_tasks
    FROM projects p
    LEFT JOIN (
      SELECT project_id, COUNT(*) as done_count FROM tasks WHERE status='done' GROUP BY project_id
    ) done ON done.project_id = p.id
    LEFT JOIN (
      SELECT project_id, COUNT(*) as total_count FROM tasks GROUP BY project_id
    ) total ON total.project_id = p.id
  `;
  const where: string[] = [];
  const vals: any[] = [];
  if (status) { vals.push(status); where.push(`p.status=$${vals.length}`); }
  if (client) { vals.push(client); where.push(`p.client=$${vals.length}`); }
  if (search) { vals.push(`%${search}%`); where.push(`(p.title ILIKE $${vals.length} OR p.client ILIKE $${vals.length})`); }
  if (where.length) base += ' WHERE ' + where.join(' AND ');
  base += ' ORDER BY p.created_at DESC';
  const r = await db.query(base, vals);
  res.json({ projects: r.rows });
}

export async function getProject(req: Request, res: Response) {
  const { id } = req.params;
  const r = await db.query('SELECT * FROM projects WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  const project = r.rows[0];
  const sprints = (await db.query('SELECT * FROM sprints WHERE project_id=$1 ORDER BY position, sprint_number', [id])).rows;
  const tasks = (await db.query('SELECT * FROM tasks WHERE project_id=$1 ORDER BY created_at DESC', [id])).rows;
  // compute progress
  const total = tasks.length;
  const done = tasks.filter((t:any) => t.status === 'done').length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  res.json({ project, sprints, tasks, progress, total_tasks: total, done_tasks: done });
}

export async function updateProject(req: Request, res: Response) {
  const { id } = req.params;
  const data = CreateProject.partial().parse(req.body);
  const fields = Object.keys(data);
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  const sets = fields.map((f, i) => `${f}=$${i+2}`).join(', ');
  const vals = [id, ...fields.map(k => (data as any)[k])];
  const q = `UPDATE projects SET ${sets} WHERE id=$1 RETURNING *`;
  const r = await db.query(q, vals);
  res.json({ project: r.rows[0] });
}

export async function deleteProject(req: Request, res: Response) {
  const { id } = req.params;
  await db.query('DELETE FROM projects WHERE id=$1', [id]);
  res.json({ success: true });
}

/** Sprints */
const CreateSprint = z.object({
  title: z.string().min(1),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

export async function createSprintForProject(req: Request, res: Response) {
  const { id: project_id } = req.params;
  const data = CreateSprint.parse(req.body);
  // compute next sprint_number for this project
  const r = await db.query('SELECT COALESCE(MAX(sprint_number),0) as maxnum FROM sprints WHERE project_id=$1', [project_id]);
  const sprint_number = (r.rows[0].maxnum || 0) + 1;
  // position default = sprint_number
  const q = `INSERT INTO sprints (project_id, title, sprint_number, start_date, end_date, position) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const resu = await db.query(q, [project_id, data.title, sprint_number, data.start_date || null, data.end_date || null, sprint_number]);
  res.status(201).json({ sprint: resu.rows[0] });
}

export async function listSprintsForProject(req: Request, res: Response) {
  const { id } = req.params;
  const r = await db.query('SELECT * FROM sprints WHERE project_id=$1 ORDER BY position, sprint_number', [id]);
  res.json({ sprints: r.rows });
}
