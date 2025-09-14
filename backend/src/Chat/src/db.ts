import pg from 'pg'; const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function migrate() {
  await pool.query(`
    create table if not exists chat_messages(
      id bigserial primary key,
      room text not null,
      user_id text,
      user_name text,
      text text not null,
      created_at timestamptz not null default now()
    );
    create index if not exists chat_room_created_idx on chat_messages(room, created_at desc);
  `);
}
