# ⚡ Быстрый старт без PostgreSQL

Если вы хотите быстро протестировать систему без установки PostgreSQL, следуйте этим шагам:

## Вариант 1: Установка PostgreSQL (рекомендуется)

### macOS - Установка через Homebrew

```bash
# Установите Homebrew (если еще не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите PostgreSQL
brew install postgresql@15

# Запустите PostgreSQL
brew services start postgresql@15

# Создайте базу данных
createdb tender_crm

# Проверьте подключение
psql tender_crm
```

Затем запустите миграции:
```bash
cd server
npm run db:push
```

## Вариант 2: Использование Docker (если есть Docker)

```bash
# Запустите PostgreSQL в Docker
docker run --name tender-crm-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tender_crm \
  -p 5432:5432 \
  -d postgres:15

# Проверьте, что контейнер запущен
docker ps

# Запустите миграции
cd server
npm run db:push
```

## Вариант 3: Использование онлайн PostgreSQL

Можно использовать бесплатные облачные сервисы:

### Supabase (рекомендуется)
1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Скопируйте Connection String из Settings → Database
4. Обновите `server/.env`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
```

### ElephantSQL
1. Зарегистрируйтесь на https://www.elephantsql.com
2. Создайте новый инстанс (бесплатный план Tiny Turtle)
3. Скопируйте URL
4. Обновите `server/.env`

## 🚀 После установки PostgreSQL

```bash
# 1. Запустите миграции
cd server
npm run db:push

# Вы должны увидеть:
# ✅ Миграция успешно завершена!
# 📧 Администратор создан:
#    Email: Armen@gmail.ru
#    Пароль: Armen@gmail.ru

# 2. Запустите backend
npm run dev

# 3. В новом терминале запустите frontend
cd ..
npm run dev

# 4. Откройте браузер
# http://localhost:5173

# 5. Войдите как администратор
# Email: Armen@gmail.ru
# Пароль: Armen@gmail.ru
```

## ✅ Проверка работы

После входа вы должны увидеть:
- Пустую систему (без данных из localStorage)
- Все созданные данные сохраняются в PostgreSQL
- При обновлении страницы данные НЕ исчезают
- Можно выйти и войти снова - данные остаются

## 🎯 Что изменилось

### До (с localStorage):
- ❌ Данные исчезают при очистке браузера
- ❌ Данные не синхронизируются между устройствами
- ❌ Нет реальной аутентификации
- ❌ Нет разделения прав доступа

### После (с PostgreSQL):
- ✅ Данные хранятся постоянно
- ✅ Доступ с любого устройства
- ✅ Реальная аутентификация с JWT
- ✅ Администратор видит все данные
- ✅ Обычные пользователи видят только свои данные

## 🔧 Устранение проблем

### "connection refused" при запуске сервера

PostgreSQL не запущен:
```bash
# macOS
brew services start postgresql@15

# Docker
docker start tender-crm-postgres
```

### "database does not exist"

Создайте базу данных:
```bash
createdb tender_crm

# Или через psql
psql -U postgres
CREATE DATABASE tender_crm;
\q
```

### "role postgres does not exist"

Создайте пользователя:
```bash
createuser -s postgres
```

### Порт 3001 уже занят

Измените порт в `server/.env`:
```
PORT=3002
```

И обновите URL в frontend (когда будем интегрировать).

## 📞 Нужна помощь?

1. Проверьте логи сервера в терминале
2. Проверьте, что PostgreSQL запущен: `brew services list`
3. Проверьте подключение: `psql tender_crm`
4. Убедитесь, что `.env` файл настроен правильно

## 🎓 Следующие шаги

После успешного запуска backend:
1. Интегрируем frontend с API
2. Заменим localStorage на HTTP запросы
3. Добавим хранение JWT токена
4. Реализуем автоматическую авторизацию при перезагрузке

Готовы продолжить? 🚀
