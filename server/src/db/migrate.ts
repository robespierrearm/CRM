import { pool } from './index.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('🚀 Начало миграции базы данных...');

    // Читаем SQL схему
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf-8');

    // Генерируем хеш пароля для администратора
    const adminPassword = 'Armen@gmail.ru';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Заменяем placeholder на реальный хеш
    schema = schema.replace('$2b$10$placeholder', passwordHash);

    // Выполняем миграцию
    await pool.query(schema);

    console.log('✅ Миграция успешно завершена!');
    console.log('📧 Администратор создан:');
    console.log('   Email: Armen@gmail.ru');
    console.log('   Пароль: Armen@gmail.ru');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  }
}

migrate();
