import { Request, Response } from 'express';
import db from '../services/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'member']).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function register(req: Request, res: Response) {
  const parsed = RegisterSchema.parse(req.body);
  const { name, email, password, role = 'member' } = parsed;
  const hashed = await bcrypt.hash(password, 10);
  const insert = `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role`;
  const result = await db.query(insert, [name, email, hashed, role]);
  res.status(201).json({ user: result.rows[0] });
}

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.parse(req.body);
  const { email, password } = parsed;
  const q = 'SELECT id, name, email, password_hash, role FROM users WHERE email=$1 LIMIT 1';
  const r = await db.query(q, [email]);
  const user = r.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || '', { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
