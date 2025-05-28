import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const db = new Pool({
  user: process.env.DB_USER || 'ispc',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'ispc',
  password: process.env.DB_PASSWORD || 'ispc123',
  port: parseInt(process.env.DB_PORT || '5432'),
}); 