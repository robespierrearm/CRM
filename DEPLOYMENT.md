# 🚀 Деплой на GitHub Pages

## ✅ Проект настроен для GitHub Pages

**URL:** https://robespierrearm.github.io/CRM/

---

## 📋 Настройки проекта

### 1. vite.config.ts
```typescript
base: '/CRM/'  // Название репозитория
```

### 2. App.tsx
```typescript
<BrowserRouter basename="/CRM">  // Роутинг с basename
```

### 3. package.json
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

---

## 🔧 Как деплоить

### Автоматический деплой:
```bash
npm run deploy
```

Эта команда:
1. ✅ Соберет проект (`npm run build`)
2. ✅ Загрузит в ветку `gh-pages`
3. ✅ Обновит сайт (2-5 минут)

### Ручной деплой:
```bash
# 1. Собрать проект
npm run build

# 2. Задеплоить
npx gh-pages -d dist --dotfiles
```

---

## ✅ Проверка работы

### Локально:
```bash
npm run dev
# Откроется http://localhost:5173
```

### Production:
```bash
npm run build
npm run preview
# Откроется http://localhost:4173
```

### GitHub Pages:
```
https://robespierrearm.github.io/CRM/
```

⏱️ После деплоя подождите 2-5 минут для обновления

---

## 🐛 Решение проблем

### Белый экран
1. Очистите кеш браузера (Ctrl+Shift+Delete)
2. Обновите страницу (Ctrl+F5)
3. Подождите 5 минут после деплоя

### 404 ошибки
- Убедитесь что `base: '/CRM/'` в vite.config.ts
- Убедитесь что `basename="/CRM"` в App.tsx
- Проверьте что файлы `404.html` и `.nojekyll` в `public/`

### Старая версия загружается
```bash
# Сделайте force деплой
rm -rf dist
npm run build
npx gh-pages -d dist --dotfiles -f
```

---

## 📁 Структура деплоя

```
dist/
├── index.html          # Главная страница
├── 404.html           # Редирект для SPA
├── .nojekyll          # Отключение Jekyll
└── assets/
    ├── index-*.js     # JavaScript бандл
    └── index-*.css    # CSS стили
```

---

## 🔐 Данные для входа

```
Email: admin@example.com
Пароль: admin123
```

---

## ✨ Готово!

Проект настроен и готов к работе на GitHub Pages!
