#!/bin/bash

echo "🧹 Полная очистка и деплой на GitHub Pages"
echo "==========================================="
echo ""

# Удаляем локальную ветку gh-pages если есть
git branch -D gh-pages 2>/dev/null

# Удаляем dist и кэши
echo "🗑️  Очистка локальных файлов..."
rm -rf dist node_modules/.cache node_modules/.vite

# Собираем проект
echo "📦 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки"
    exit 1
fi

echo "✅ Проект собран"
echo ""

# Проверяем содержимое dist/index.html
echo "🔍 Проверка dist/index.html..."
if grep -q "src=/src/main.tsx" dist/index.html; then
    echo "❌ ОШИБКА: dist/index.html содержит неправильную ссылку!"
    exit 1
fi

if grep -q "/CRM/assets/" dist/index.html; then
    echo "✅ dist/index.html содержит правильные ссылки"
else
    echo "❌ ОШИБКА: dist/index.html не содержит правильных ссылок!"
    exit 1
fi

# Деплоим
echo ""
echo "🚀 Деплой на GitHub Pages..."
npx gh-pages -d dist --dotfiles --remove '**/*'

echo ""
echo "✅ Деплой завершен!"
echo "🌐 Сайт будет доступен через 1-2 минуты по адресу:"
echo "   https://robespierrearm.github.io/CRM/"
echo ""
echo "💡 Если видите старую версию - откройте в режиме инкогнито"
