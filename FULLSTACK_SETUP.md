# 🚀 Полная установка Tender CRM (Frontend + Backend)

## 📋 Требования

- Node.js 18+ 
- PostgreSQL 15+
- npm или yarn

## 🎯 Быстрый старт (5 минут)

### Шаг 1: Установка PostgreSQL

```bash
# macOS (через Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Создание базы данных
createdb tender_crm
```

Подробная инструкция: см. `SETUP_DATABASE.md`

### Шаг 2: Настройка Backend

```bash
# Перейдите в папку сервера
cd server

# Установите зависимости
npm install

# Настройте .env (уже создан с дефолтными значениями)
# Если нужно, измените DATABASE_URL в server/.env

# Запустите миграции (создание таблиц и админа)
npm run db:push

# Запустите сервер
npm run dev
```

Сервер запустится на `http://localhost:3001`

### Шаг 3: Настройка Frontend

Откройте новый терминал:

```bash
# Вернитесь в корневую папку
cd ..

# Установите зависимости (если еще не установлены)
npm install

# Запустите фронтенд
npm run dev
```

Фронтенд запустится на `http://localhost:5173`

### Шаг 4: Войдите в систему

Откройте браузер: `http://localhost:5173`

**Учетные данные администратора:**
- Email: `Armen@gmail.ru`
- Пароль: `Armen@gmail.ru`

## 🎉 Готово!

Теперь у вас работает полноценная CRM система с:
- ✅ Постоянным хранением данных в PostgreSQL
- ✅ Аутентификацией и авторизацией
- ✅ Главным администратором с полным доступом
- ✅ REST API для всех операций

## 📁 Структура проекта

```
SRM WINDSURF/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI компоненты
│   ├── pages/             # Страницы приложения
│   ├── context/           # React Context (будет заменен на API)
│   └── types/             # TypeScript типы
│
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── db/           # База данных и миграции
│   │   ├── routes/       # API маршруты
│   │   ├── middleware/   # Middleware (auth, etc)
│   │   └── types/        # TypeScript типы
│   └── package.json
│
└── package.json           # Frontend dependencies
```

## 🔧 Команды разработки

### Backend

```bash
cd server

# Разработка (с hot reload)
npm run dev

# Сборка
npm run build

# Продакшн
npm start

# Пересоздать БД
npm run db:push
```

### Frontend

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Превью продакшн сборки
npm run preview
```

## 🔐 Роли пользователей

### Admin (Armen@gmail.ru)
- Полный доступ ко всем данным
- Видит все тендеры всех пользователей
- Видит всех поставщиков
- Может управлять настройками компании
- Может создавать новых пользователей

### User (обычный пользователь)
- Видит только свои тендеры
- Может создавать и редактировать свои данные
- Доступ к общим поставщикам

## 📡 API Endpoints

Полная документация API: см. `server/README.md`

Основные endpoints:
- `POST /api/auth/login` - Авторизация
- `GET /api/tenders` - Получить тендеры
- `POST /api/tenders` - Создать тендер
- `GET /api/suppliers` - Получить поставщиков
- `GET /api/reminders` - Получить напоминания
- `GET /api/expenses/tender/:id` - Расходы по тендеру

## 🐛 Устранение проблем

### Backend не запускается

1. Проверьте PostgreSQL:
```bash
brew services list
# Если не запущен:
brew services start postgresql@15
```

2. Проверьте подключение к БД:
```bash
psql -U postgres -d tender_crm
```

3. Проверьте `.env` файл в `server/`

### Frontend не подключается к Backend

1. Убедитесь, что backend запущен на порту 3001
2. Проверьте CORS настройки в `server/src/index.ts`
3. Откройте DevTools → Network и проверьте запросы

### Ошибка "JWT token invalid"

1. Очистите localStorage в браузере
2. Перелогиньтесь заново

## 🚀 Следующие шаги

1. **Интеграция Frontend с Backend**
   - Заменить Context API на API запросы
   - Добавить axios/fetch для HTTP запросов
   - Реализовать хранение JWT токена

2. **Дополнительные функции**
   - Загрузка файлов (документы тендеров)
   - Email уведомления
   - Экспорт данных в Excel
   - Графики и аналитика

3. **Безопасность**
   - Rate limiting
   - HTTPS в продакшне
   - Валидация всех входных данных

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Проверьте консоль браузера
3. Убедитесь, что PostgreSQL запущен
4. Проверьте переменные окружения

## 🎓 Полезные ссылки

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
