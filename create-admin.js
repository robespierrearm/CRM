/**
 * Скрипт для создания администратора admin@crm.ru в Supabase
 * 
 * Запуск: node create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Загружаем переменные окружения из .env.local
const envContent = readFileSync('.env.local', 'utf8');

// Парсим .env.local вручную
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('Проверьте файл .env.local');
  process.exit(1);
}

console.log('🔧 Подключение к Supabase...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdminUser() {
  try {
    console.log('\n📝 Создание пользователя admin@crm.ru...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@crm.ru',
      password: 'admin123',
      options: {
        data: {
          full_name: 'Администратор',
          role: 'admin'
        },
        emailRedirectTo: undefined // Отключаем редирект
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Пользователь admin@crm.ru уже существует!');
        console.log('\n✅ Можете войти с данными:');
        console.log('   Email: admin@crm.ru');
        console.log('   Пароль: admin123');
        return;
      }
      throw error;
    }

    if (data.user) {
      console.log('✅ Пользователь успешно создан!');
      console.log('\n📧 Email:', data.user.email);
      console.log('🆔 ID:', data.user.id);
      
      if (data.session) {
        console.log('🔑 Сессия создана автоматически');
      } else {
        console.log('⚠️  Может потребоваться подтверждение email');
        console.log('   Проверьте настройки Email Auth в Supabase Dashboard');
      }
      
      console.log('\n✅ Теперь можете войти в приложение:');
      console.log('   URL: http://localhost:5173');
      console.log('   Email: admin@crm.ru');
      console.log('   Пароль: admin123');
    }

  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error.message);
    console.error('\n💡 Возможные решения:');
    console.error('   1. Проверьте настройки Email Auth в Supabase Dashboard');
    console.error('   2. Отключите Email Confirmation в Settings → Authentication');
    console.error('   3. Создайте пользователя вручную через Dashboard → Authentication → Users');
    process.exit(1);
  }
}

// Запускаем создание пользователя
createAdminUser();
