import db from './services/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  try {
    const pw = await bcrypt.hash('Admin123!', 10);
    // create admin
    await db.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES (gen_random_uuid(), 'Seed Admin', 'admin@local.test', $1, 'admin') ON CONFLICT DO NOTHING`, [pw]);

    const pw2 = await bcrypt.hash('Manager123!', 10);
    await db.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES (gen_random_uuid(), 'Seed Manager', 'manager@local.test', $1, 'manager') ON CONFLICT DO NOTHING`, [pw2]);

    const pw3 = await bcrypt.hash('Member123!', 10);
    await db.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES (gen_random_uuid(), 'Seed Member', 'member@local.test', $1, 'member') ON CONFLICT DO NOTHING`, [pw3]);

    // sample project
    const p = await db.query(`INSERT INTO projects (title, client, description, start_date, end_date, budget, status, created_by) 
      VALUES ('Seed Project', 'Seed Client', 'A seed project for testing', now(), now() + interval '30 day', 10000.0, 'active',
      (SELECT id FROM users WHERE email='admin@local.test')) RETURNING id`);
    const pid = p.rows[0].id;
    // two sprints
    await db.query(`INSERT INTO sprints (project_id, title, sprint_number, start_date, end_date, position) VALUES ($1,'Sprint 1',1,now(),now() + interval '7 day',1)`, [pid]);
    await db.query(`INSERT INTO sprints (project_id, title, sprint_number, start_date, end_date, position) VALUES ($1,'Sprint 2',2,now() + interval '8 day',now() + interval '15 day',2)`, [pid]);

    console.log('Seeded users and project');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
