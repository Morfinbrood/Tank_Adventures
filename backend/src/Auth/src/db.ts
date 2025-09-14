import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function migrate() {
  await pool.query(`
    create table if not exists users(
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      name text not null,
      password_hash text not null,
      created_at timestamptz not null default now()
    );
    create table if not exists refresh_tokens(
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      token_hash text not null,
      created_at timestamptz not null default now()
    );
  `);
}
