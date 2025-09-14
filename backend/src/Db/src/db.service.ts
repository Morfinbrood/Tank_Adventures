import pg from 'pg';
const { Pool } = pg;
export class DbService {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  async ensureExtensions(){ await this.pool.query('create extension if not exists pgcrypto'); }
}
