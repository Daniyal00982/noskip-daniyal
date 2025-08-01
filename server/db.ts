import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }
  
  return db;
}

export type Database = ReturnType<typeof getDatabase>;