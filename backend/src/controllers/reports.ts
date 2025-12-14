import { Request, Response } from "express";
import db from "../services/db";

export async function projectReport(req: Request, res: Response) {
  const { projectId } = req.params;

  const projectDetail = await db.query(
    "SELECT title, client, description, start_date, end_date, status FROM projects WHERE id=$1", [projectId])

  const total = await db.query(
    "SELECT COUNT(*) FROM tasks WHERE project_id=$1",
    [projectId]
  );

  const done = await db.query(
    "SELECT COUNT(*) FROM tasks WHERE project_id=$1 AND status='done'",
    [projectId]
  );

  const remaining = await db.query(
    "SELECT status, COUNT(*) FROM tasks WHERE project_id=$1 AND status!='done' GROUP BY status",
    [projectId]
  );

  const time = await db.query(
    `SELECT u.name, SUM(tl.minutes) as minutes
     FROM timelogs tl
     JOIN users u ON u.id=tl.user_id
     JOIN tasks t ON t.id=tl.task_id
     WHERE t.project_id=$1
     GROUP BY u.name`,
    [projectId]
  );

  const totalTasks = Number(total.rows[0].count);
  const doneTasks = Number(done.rows[0].count);
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  res.json({
    projectDetail: projectDetail.rows[0],
    totalTasks,
    doneTasks,
    progress,
    remaining: remaining.rows,
    timeByUser: time.rows
  });
}
