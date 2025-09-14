import pg from 'pg'; const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function migrate() {
  await pool.query(`
    create table if not exists lobbies(
      id uuid primary key default gen_random_uuid(),
      name text not null,
      host_user_id uuid not null,
      created_at timestamptz not null default now(),
      started boolean not null default false
    );
    create table if not exists lobby_players(
      lobby_id uuid not null references lobbies(id) on delete cascade,
      user_id uuid not null,
      ready boolean not null default false,
      joined_at timestamptz not null default now(),
      primary key(lobby_id, user_id)
    );
  `);
}
