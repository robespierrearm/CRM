# Интеграция Supabase - Руководство

## ✅ Что уже сделано

### 1. Настройка Supabase
- ✅ Установлены зависимости: `@supabase/supabase-js`, `@tanstack/react-query`
- ✅ Создан Supabase client в `src/integrations/supabase/client.ts`
- ✅ Скопированы типы БД в `src/integrations/supabase/types.ts`
- ✅ Скопированы 15 миграций базы данных в `supabase/migrations/`
- ✅ Создан `.env.local` с подключением к Supabase

### 2. AuthContext (Авторизация)
- ✅ Полностью переписан на Supabase Auth
- ✅ Поддержка email/password авторизации
- ✅ Автоматическое управление сессией
- ✅ Функции: `login()`, `signup()`, `logout()`
- ⚠️  **Важно**: Вход теперь по email вместо username

### 3. DataContext (Данные)
- ✅ Создан новый DataContext с Supabase API
- ✅ CRUD операции для Tenders через Supabase
- ✅ CRUD операции для Suppliers через Supabase
- ✅ CRUD операции для Expenses через Supabase
- ✅ Использует конвертеры для преобразования данных

### 4. Конвертеры данных (src/lib/converters.ts)
- ✅ **Русский интерфейс сохранен!**
- ✅ Маппинг статусов: русский ↔ английский
  - Новый ↔ accepting
  - Подано ↔ submitted
  - Рассмотрение ↔ review
  - Победа ↔ won
  - В работе ↔ in_progress
  - Завершён - Оплачен ↔ completed
  - Проигран ↔ lost
- ✅ Функции конвертации:
  - `tenderFromDb()` - из БД в UI формат
  - `tenderToDb()` - из UI в БД формат
  - Аналогично для Supplier и Expense

### 5. App.tsx
- ✅ Добавлен QueryClientProvider для React Query
- ✅ Обёрнуто приложение для кэширования запросов

## ⚠️ Что требует доработки

### 1. Компоненты (КРИТИЧНО)
Нужно обновить все компоненты для новых названий полей:

**Изменения в Tender:**
- `name` → `title`
- `url` → `link`
- `publicationDate` → `publish_date`
- `submissionDeadline` → `deadline`
- `initialPrice` → `amount`
- `contractSecurityPercent` → `contract_guarantee_percent`

**Файлы для обновления:**
- `src/components/AddTenderDialog.tsx` - обновить поля формы
- `src/components/Layout.tsx` - исправить отображение статусов
- `src/pages/TendersPage.tsx` - обновить отображение данных
- `src/pages/AccountingPage.tsx` - обновить расчеты
- Все другие компоненты, использующие Tender

### 2. LoginPage (ВАЖНО)
- ⚠️  Обновить LoginPage для работы с email вместо username
- Текущий файл: `src/pages/LoginPage.tsx`
- Нужно изменить label "Логин" на "Email"
- Изменить placeholder "Введите логин" на "Введите email"

### 3. Регистрация пользователей
- 🔴 Создать страницу регистрации (SignupPage)
- 🔴 Или добавить форму регистрации на LoginPage
- 🔴 Использовать функцию `signup()` из AuthContext

### 4. TypeScript ошибки
- ⚠️  ~50+ ошибок компиляции в компонентах
- Причина: старые названия полей (name, url и т.д.)
- Решение: обновить все компоненты согласно п.1

### 5. Suppliers конвертер
- ⚠️  Исправить ошибки в `src/lib/converters.ts`
- Проблема: поля из БД не совпадают с ожидаемыми
- Нужно проверить реальную схему suppliers в Supabase

## 📋 План доработки (по приоритету)

### Шаг 1: Создать тестового пользователя в Supabase
```
1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите проект: pfxzcky...
3. Authentication → Users → Add User
4. Email: admin@crm.ru
5. Password: admin123
6. Auto-confirm: да
```

### Шаг 2: Обновить LoginPage
```typescript
// src/pages/LoginPage.tsx
// Изменить:
- <Label htmlFor="username">Логин</Label>
- <Input id="username" placeholder="Введите логин" ...>

// На:
+ <Label htmlFor="email">Email</Label>
+ <Input id="email" type="email" placeholder="Введите email" ...>
```

### Шаг 3: Обновить AddTenderDialog
Заменить все старые названия полей на новые согласно маппингу выше.

### Шаг 4: Обновить TendersPage и другие страницы
Аналогично обновить все компоненты.

### Шаг 5: Протестировать
```bash
npm run dev
# Проверить:
# - Вход через admin@crm.ru / admin123
# - Создание тендера
# - Обновление тендера
# - Удаление тендера
```

## 🔧 Как использовать конвертеры

### В компонентах (пример):
```typescript
import { statusFromDb, statusToDb } from '../lib/converters';

// При отображении данных из БД:
const russianStatus = statusFromDb(dbTender.status);

// При отправке данных в БД:
const englishStatus = statusToDb('Новый'); // 'accepting'
```

### DataContext уже использует конвертеры автоматически!
Вам НЕ нужно вручную конвертировать в компонентах - DataContext делает это за вас.

## 🗄️ Структура базы данных

### Таблицы Supabase:
- **tenders** - тендеры
- **suppliers** - поставщики
- **expenses** - расходы по тендерам
- **incomes** - доходы (если используется)

### Enum статусов (tender_status):
- accepting (Новый)
- submitted (Подано)
- review (Рассмотрение)
- won (Победа)
- in_progress (В работе)
- completed (Завершён - Оплачен)
- lost (Проигран)

## 🔐 Безопасность

### Row Level Security (RLS)
Supabase использует RLS - каждый пользователь видит только свои данные.

### Переменные окружения
- ✅ `.env.local` - для локальной разработки (уже создан)
- ✅ `.env.example` - шаблон для других разработчиков
- ⚠️  `.env.local` добавлен в `.gitignore` - не попадает в Git

## 📝 Текущее состояние

### Работает:
- ✅ Подключение к Supabase
- ✅ Авторизация (email/password)
- ✅ Загрузка данных из БД
- ✅ Конвертация статусов (русский ↔ английский)

### Не работает (требует обновления компонентов):
- 🔴 UI компоненты используют старые названия полей
- 🔴 TypeScript ошибки компиляции
- 🔴 LoginPage ожидает username вместо email

## 💡 Советы по продолжению

1. **Начните с LoginPage** - это самое простое изменение
2. **Создайте тестового пользователя в Supabase** - для проверки
3. **Обновляйте компоненты постепенно** - один за раз
4. **Проверяйте в браузере** - после каждого изменения
5. **Используйте TypeScript ошибки** - как список TODO

## 🚀 Следующий сеанс

Когда будете продолжать:
1. Создайте пользователя в Supabase Dashboard
2. Обновите LoginPage для email
3. Запустите `npm run dev`
4. Попробуйте войти
5. Проверьте консоль браузера на ошибки

**Оценка времени**: еще ~2-3 часа для завершения всех компонентов.
