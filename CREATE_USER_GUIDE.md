# 🔐 Создание пользователя admin@crm.ru в Supabase

## Проблема
Не получается авторизоваться, потому что пользователь `admin@crm.ru` не создан в базе данных Supabase.

## ✅ Решение 1: Через Supabase Dashboard (РЕКОМЕНДУЕТСЯ)

### Шаги:

1. **Откройте Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/pfxzckysajoeuafisfym
   ```

2. **Перейдите в раздел Authentication:**
   - В левом меню найдите "Authentication"
   - Нажмите на "Users"

3. **Создайте нового пользователя:**
   - Нажмите кнопку "Add User" (или "Invite")
   - Выберите "Create new user"

4. **Заполните данные:**
   ```
   Email: admin@crm.ru
   Password: admin123
   ```

5. **Важно! Включите Auto Confirm:**
   - Поставьте галочку "Auto Confirm User"
   - Это позволит сразу войти без подтверждения email

6. **Нажмите "Create user"**

7. **Готово!** Теперь можно войти в приложение

---

## ✅ Решение 2: Через SQL Editor в Supabase

### Шаги:

1. **Откройте SQL Editor в Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/pfxzckysajoeuafisfym/sql
   ```

2. **Создайте новый запрос (New Query)**

3. **Скопируйте и вставьте этот SQL:**

```sql
-- Создание пользователя admin@crm.ru
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Проверяем, существует ли пользователь
  SELECT id INTO user_id FROM auth.users WHERE email = 'admin@crm.ru';
  
  IF user_id IS NULL THEN
    -- Создаем пользователя
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
      crypt('admin123', gen_salt('bf')),
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
```

4. **Нажмите "Run" (или F5)**

5. **Проверьте результат:**
   - Должно появиться сообщение "Пользователь admin@crm.ru успешно создан!"

---

## ✅ Решение 3: Использовать функцию регистрации в приложении

Если не хотите заходить в Supabase Dashboard, можно добавить временную страницу регистрации:

1. **Откройте приложение:** http://localhost:5173

2. **Используйте функцию signup из AuthContext**
   - Можно временно добавить форму регистрации на LoginPage
   - Или создать отдельную страницу /signup

---

## 🔍 Проверка создания пользователя

После создания пользователя проверьте в Supabase Dashboard:

1. **Authentication → Users**
2. Должен появиться пользователь с email `admin@crm.ru`
3. Статус должен быть "Confirmed" (зеленая галочка)

---

## 🚀 После создания пользователя

1. **Откройте приложение:**
   ```
   http://localhost:5173
   ```

2. **Войдите с данными:**
   ```
   Email: admin@crm.ru
   Пароль: admin123
   ```

3. **Готово!** Вы должны успешно войти в систему

---

## ⚠️ Если всё равно не работает

### Очистите localStorage:

1. Откройте DevTools (F12)
2. Console → введите:
   ```javascript
   localStorage.clear()
   ```
3. Обновите страницу (F5)
4. Попробуйте войти снова

### Проверьте консоль браузера:

1. Откройте DevTools (F12)
2. Перейдите на вкладку "Console"
3. Посмотрите на ошибки при попытке входа
4. Если есть ошибки - сообщите их

---

## 📝 Примечания

- **Supabase Auth** управляет пользователями отдельно от основных таблиц
- Пользователи хранятся в специальной схеме `auth.users`
- Нельзя создавать пользователей напрямую через обычные INSERT запросы
- Рекомендуется использовать Supabase Dashboard или Auth API

---

## 🔗 Полезные ссылки

- **Ваш проект в Supabase:** https://supabase.com/dashboard/project/pfxzckysajoeuafisfym
- **Документация Supabase Auth:** https://supabase.com/docs/guides/auth
- **SQL Editor:** https://supabase.com/dashboard/project/pfxzckysajoeuafisfym/sql

---

## ✅ Готово!

После создания пользователя через любой из способов выше, вы сможете войти в CRM систему.
