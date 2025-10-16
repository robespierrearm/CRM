-- Создание тестового пользователя admin@crm.ru
-- Этот скрипт нужно выполнить в Supabase SQL Editor

-- Примечание: Supabase Auth использует специальную таблицу auth.users
-- Пользователей нужно создавать через Supabase Dashboard или API

-- Инструкция для создания пользователя:
-- 1. Откройте Supabase Dashboard: https://supabase.com/dashboard
-- 2. Выберите ваш проект
-- 3. Перейдите в Authentication → Users
-- 4. Нажмите "Add User" → "Create new user"
-- 5. Введите:
--    Email: admin@crm.ru
--    Password: admin123
--    Auto Confirm User: ✓ (включить)
-- 6. Нажмите "Create user"

-- Альтернативный способ через SQL (выполнить в SQL Editor):
-- Внимание: это создаст пользователя напрямую в auth.users

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Проверяем, существует ли пользователь
  SELECT id INTO user_id FROM auth.users WHERE email = 'admin@crm.ru';
  
  IF user_id IS NULL THEN
    -- Создаем пользователя через auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@crm.ru',
      crypt('admin123', gen_salt('bf')), -- Хешируем пароль
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin","full_name":"Администратор"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Пользователь admin@crm.ru успешно создан!';
  ELSE
    RAISE NOTICE 'Пользователь admin@crm.ru уже существует.';
  END IF;
END $$;
