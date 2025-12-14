import { Request, Response } from "express";
import db from "../services/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "member"]),
  department: z.string().optional(),
  skills: z.array(z.string()).optional(),
  password: z.string().min(6).optional() // optional for invite flow
});

export async function createUser(req: Request, res: Response) {
  console.log('hitt')
  const data = CreateUserSchema.parse(req.body);

  const password = data.password || Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(password, 10);

  const q = `
    INSERT INTO users (name, email, role, department, skills, password_hash)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, name, email, role, department, skills
  `;

  const r = await db.query(q, [
    data.name,
    data.email,
    data.role,
    data.department || null,
    data.skills || [],
    hash
  ]);

  res.status(201).json({
    user: r.rows[0],
    tempPassword: data.password ? undefined : password // show once
  });
}

export async function listUsers(req: Request, res: Response) {
  const r = await db.query(
    `SELECT id, name, email, role, department, skills, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json({ users: r.rows });
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const allowed = ["name", "role", "department", "skills"];
  const data = req.body;

  const fields = Object.keys(data).filter(k => allowed.includes(k));
  if (!fields.length) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const sets = fields.map((f, i) => `${f}=$${i + 2}`).join(", ");
  const vals = [id, ...fields.map(k => data[k])];

  const q = `UPDATE users SET ${sets} WHERE id=$1 RETURNING id,name,email,role,department,skills`;
  const r = await db.query(q, vals);

  res.json({ user: r.rows[0] });
}
