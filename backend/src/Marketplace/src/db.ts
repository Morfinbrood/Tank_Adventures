import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function listItems() {
  const q = await pool.query('select id, name, created_at from items order by created_at asc');
  return q.rows as Array<{ id: string; name: string; created_at: string }>;
}
