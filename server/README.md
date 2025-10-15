# Tender CRM Backend

Бэкенд сервер для системы управления тендерами с PostgreSQL базой данных.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка базы данных

Убедитесь, что PostgreSQL установлен и запущен. Создайте базу данных:

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE tender_crm;

# Выйдите
\q
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте параметры:

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/tender_crm
JWT_SECRET=ваш-секретный-ключ
PORT=3001
NODE_ENV=development
```

### 4. Запуск миграций

```bash
npm run db:push
```

Это создаст все таблицы и главного администратора:
- **Email**: Armen@gmail.ru
- **Пароль**: Armen@gmail.ru

### 5. Запуск сервера

```bash
# Режим разработки (с hot reload)
npm run dev

# Продакшн
npm run build
npm start
```

Сервер запустится на `http://localhost:3001`

## 📚 API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Авторизация
- `GET /api/auth/me` - Получить текущего пользователя

### Тендеры

- `GET /api/tenders` - Получить все тендеры
- `GET /api/tenders/:id` - Получить тендер по ID
- `POST /api/tenders` - Создать тендер
- `PUT /api/tenders/:id` - Обновить тендер
- `DELETE /api/tenders/:id` - Удалить тендер

### Поставщики

- `GET /api/suppliers` - Получить всех поставщиков
- `POST /api/suppliers` - Создать поставщика
- `PUT /api/suppliers/:id` - Обновить поставщика
- `DELETE /api/suppliers/:id` - Удалить поставщика

### Напоминания

- `GET /api/reminders` - Получить все напоминания
- `POST /api/reminders` - Создать напоминание
- `PUT /api/reminders/:id` - Обновить напоминание
- `DELETE /api/reminders/:id` - Удалить напоминание

### Расходы

- `GET /api/expenses/tender/:tenderId` - Получить расходы по тендеру
- `POST /api/expenses` - Создать расход
- `DELETE /api/expenses/:id` - Удалить расход

### Компания

- `GET /api/company` - Получить информацию о компании
- `PUT /api/company` - Обновить информацию (только админ)

## 🔐 Аутентификация

Все защищенные маршруты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## 👤 Главный администратор

После миграции автоматически создается главный администратор:

- **Email**: Armen@gmail.ru
- **Пароль**: Armen@gmail.ru
- **Роль**: admin

Администратор имеет полный доступ ко всем данным и настройкам системы.

## 🗄️ Структура базы данных

- `users` - Пользователи системы
- `tenders` - Тендеры
- `suppliers` - Поставщики
- `reminders` - Напоминания
- `expenses` - Расходы по тендерам
- `company_info` - Информация о компании

## 🛠️ Технологии

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей
- **Zod** - Валидация данных

## 📝 Примеры запросов

### Авторизация

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Armen@gmail.ru",
    "password": "Armen@gmail.ru"
  }'
```

### Создание тендера

```bash
curl -X POST http://localhost:3001/api/tenders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Тестовый тендер",
    "url": "https://example.com",
    "status": "Новый",
    "publication_date": "2024-01-15",
    "initial_price": 1000000,
    "contract_security_percent": 5
  }'
```

## 🔧 Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка
npm run build

# Запуск миграций
npm run db:push
```

## 📦 Деплой

1. Настройте переменные окружения на сервере
2. Установите зависимости: `npm install`
3. Соберите проект: `npm run build`
4. Запустите миграции: `npm run db:push`
5. Запустите сервер: `npm start`

## 🐛 Отладка

Логи сервера выводятся в консоль. Для детальной отладки можно добавить переменную:

```
DEBUG=*
```
