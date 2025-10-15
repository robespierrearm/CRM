import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Тестирование подключения
pool.on('connect', () => {
  console.log('✅ Подключено к базе данных PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к базе данных:', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
