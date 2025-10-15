#!/bin/bash

echo "🚀 Деплой CRM на GitHub Pages"
echo "================================"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Очистка старых файлов
echo "🧹 Очистка старых файлов..."
rm -rf dist node_modules/.vite

# Сборка проекта
echo "📦 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки"
    exit 1
fi

echo "✅ Проект собран"
echo ""

# Проверка собранных файлов
echo "🔍 Проверка собранных файлов..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ dist/index.html не найден"
    exit 1
fi

if [ ! -f "dist/.nojekyll" ]; then
    echo "❌ dist/.nojekyll не найден"
    exit 1
fi

if [ ! -f "dist/404.html" ]; then
    echo "❌ dist/404.html не найден"
    exit 1
fi

echo "✅ Все файлы на месте"
echo ""

# Проверка путей в index.html
if grep -q "/CRM/assets/" dist/index.html; then
    echo "✅ Пути в index.html правильные (/CRM/)"
else
    echo "❌ Неправильные пути в index.html"
    echo "Содержимое:"
    cat dist/index.html
    exit 1
fi

echo ""

# Деплой
echo "🚀 Деплой на GitHub Pages..."
npx gh-pages -d dist --dotfiles

if [ $? -ne 0 ]; then
    echo "❌ Ошибка деплоя"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Деплой завершен успешно!"
echo ""
echo "📡 URL: https://robespierrearm.github.io/CRM/"
echo ""
echo "⏱️  Подождите 2-5 минут для обновления"
echo "🔄 Очистите кеш браузера (Ctrl+Shift+Delete)"
echo ""
echo "================================"
