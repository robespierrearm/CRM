# Установка и настройка PostgreSQL

## Для macOS

### Вариант 1: Homebrew (рекомендуется)

```bash
# Установка PostgreSQL
brew install postgresql@15

# Запуск PostgreSQL
brew services start postgresql@15

# Проверка статуса
brew services list
```

### Вариант 2: Postgres.app

1. Скачайте с https://postgresapp.com/
2. Перетащите в Applications
3. Запустите приложение
4. Нажмите "Initialize" для создания нового сервера

## Создание базы данных

```bash
# Войдите в PostgreSQL (пароль по умолчанию: postgres)
psql -U postgres

# Создайте базу данных
CREATE DATABASE tender_crm;

# Проверьте создание
\l

# Выйдите
\q
```

## Если PostgreSQL не установлен

### Быстрая установка через Homebrew:

```bash
# Установите Homebrew (если еще не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите PostgreSQL
brew install postgresql@15

# Запустите сервис
brew services start postgresql@15

# Создайте пользователя и базу данных
createdb tender_crm
```

## Проверка подключения

```bash
# Попробуйте подключиться
psql -U postgres -d tender_crm

# Если успешно, вы увидите:
# tender_crm=#
```

## Настройка пароля (если требуется)

```bash
# Войдите в PostgreSQL
psql -U postgres

# Установите пароль
ALTER USER postgres PASSWORD 'ваш_новый_пароль';

# Выйдите
\q
```

Затем обновите `server/.env`:
```
DATABASE_URL=postgresql://postgres:ваш_новый_пароль@localhost:5432/tender_crm
```

## Альтернатива: SQLite (для быстрого старта)

Если не хотите устанавливать PostgreSQL, можно использовать SQLite (файловая БД):

1. Установите `better-sqlite3`:
```bash
cd server
npm install better-sqlite3
```

2. Измените код подключения в `server/src/db/index.ts`

Но PostgreSQL рекомендуется для продакшна!

## Проверка работы

После настройки запустите миграции:

```bash
cd server
npm run db:push
```

Вы должны увидеть:
```
✅ Миграция успешно завершена!
📧 Администратор создан:
   Email: Armen@gmail.ru
   Пароль: Armen@gmail.ru
```

## Полезные команды PostgreSQL

```bash
# Список всех баз данных
\l

# Подключиться к базе
\c tender_crm

# Список таблиц
\dt

# Описание таблицы
\d users

# Выполнить SQL запрос
SELECT * FROM users;

# Выйти
\q
```

## Устранение проблем

### Ошибка: "connection refused"

```bash
# Проверьте, запущен ли PostgreSQL
brew services list

# Если не запущен, запустите
brew services start postgresql@15
```

### Ошибка: "database does not exist"

```bash
# Создайте базу данных
createdb tender_crm
```

### Ошибка: "role does not exist"

```bash
# Создайте пользователя
createuser -s postgres
```

## Готово!

После успешной настройки PostgreSQL переходите к запуску сервера:

```bash
cd server
npm run dev
```
