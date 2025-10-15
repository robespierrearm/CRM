# 🚀 Настройка GitHub Pages для CRM

## ✅ Проект полностью настроен!

**URL:** https://robespierrearm.github.io/CRM/

---

## 📋 Все настройки на месте

### 1. ✅ vite.config.ts
```typescript
base: '/CRM/'  // Название репозитория
```

### 2. ✅ App.tsx
```typescript
<BrowserRouter basename="/CRM">
```

### 3. ✅ public/404.html
Файл для редиректа SPA роутинга

### 4. ✅ public/.nojekyll
Отключает Jekyll обработку

### 5. ✅ index.html
Содержит скрипт для SPA редиректов

---

## 🚀 Деплой

### Способ 1: Автоматический скрипт (рекомендуется)
```bash
./deploy.sh
```

### Способ 2: npm команда
```bash
npm run deploy
```

### Способ 3: Ручной
```bash
# 1. Очистка и сборка
rm -rf dist
npm run build

# 2. Проверка
ls -la dist/
cat dist/index.html | grep "/CRM/"

# 3. Деплой
npx gh-pages -d dist --dotfiles
```

---

## 🔍 Проверка работы

### Локально:
```bash
npm run dev
# http://localhost:5173
```

### Production preview:
```bash
npm run build
npm run preview
# http://localhost:4173
```

### GitHub Pages:
```
https://robespierrearm.github.io/CRM/
```

---

## ✅ Чеклист перед деплоем

- [ ] `base: '/CRM/'` в vite.config.ts
- [ ] `basename="/CRM"` в App.tsx
- [ ] Файл `public/404.html` существует
- [ ] Файл `public/.nojekyll` существует
- [ ] Проект собирается без ошибок (`npm run build`)
- [ ] В `dist/index.html` пути начинаются с `/CRM/`

---

## 🐛 Решение проблем

### Белый экран

**Причина:** Неправильные пути или кеш браузера

**Решение:**
1. Подождите 5 минут после деплоя
2. Очистите кеш браузера (Ctrl+Shift+Delete)
3. Откройте в режиме инкогнито
4. Проверьте консоль браузера (F12)

### 404 ошибки на ресурсы

**Причина:** Неправильный base в vite.config.ts

**Решение:**
```typescript
// vite.config.ts
base: '/CRM/'  // Должно совпадать с названием репозитория
```

### Роутинг не работает

**Причина:** Отсутствует basename в BrowserRouter

**Решение:**
```typescript
// App.tsx
<BrowserRouter basename="/CRM">
```

### Старая версия загружается

**Решение:**
```bash
# Force деплой
git push origin --delete gh-pages
npm run build
npx gh-pages -d dist --dotfiles
```

---

## 📁 Структура dist/

После сборки должна быть такая структура:

```
dist/
├── .nojekyll          # ✅ Отключает Jekyll
├── 404.html           # ✅ Редирект для SPA
├── index.html         # ✅ Главная страница
└── assets/
    ├── index-*.js     # ✅ JavaScript бандл
    └── index-*.css    # ✅ CSS стили
```

---

## 🔧 Проверка настроек

### Проверить vite.config.ts:
```bash
grep "base:" vite.config.ts
# Должно быть: base: '/CRM/',
```

### Проверить App.tsx:
```bash
grep "basename=" src/App.tsx
# Должно быть: <BrowserRouter basename="/CRM">
```

### Проверить собранный index.html:
```bash
npm run build
grep "/CRM/" dist/index.html
# Должны быть пути: /CRM/assets/...
```

---

## 📊 Процесс деплоя

```
1. Сборка проекта
   npm run build
   ↓
2. Создание dist/
   - index.html
   - 404.html
   - .nojekyll
   - assets/
   ↓
3. Публикация в gh-pages
   npx gh-pages -d dist --dotfiles
   ↓
4. GitHub Pages обновление
   (2-5 минут)
   ↓
5. Сайт доступен
   https://robespierrearm.github.io/CRM/
```

---

## 🎯 Важные моменты

### ✅ Правильно:
```typescript
// vite.config.ts
base: '/CRM/'

// App.tsx
<BrowserRouter basename="/CRM">

// URL
https://robespierrearm.github.io/CRM/
```

### ❌ Неправильно:
```typescript
// vite.config.ts
base: '/'  // ❌ Не работает на GitHub Pages

// App.tsx
<BrowserRouter>  // ❌ Нет basename

// URL
https://robespierrearm.github.io/  // ❌ Без /CRM/
```

---

## 📞 Поддержка

Если проблемы остались:

1. Проверьте консоль браузера (F12)
2. Проверьте Network вкладку
3. Убедитесь что все файлы в dist/
4. Попробуйте force деплой
5. Проверьте настройки репозитория на GitHub

---

## ✅ Готово!

Проект настроен и работает на GitHub Pages!

**Команда для деплоя:**
```bash
./deploy.sh
```

**URL:**
```
https://robespierrearm.github.io/CRM/
```
