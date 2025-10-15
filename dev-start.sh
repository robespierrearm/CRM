#!/bin/bash

echo "🚀 Запуск CRM приложения в режиме разработки..."
echo ""

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
    echo ""
fi

echo "🔧 Запускаем сервер разработки..."
echo "📱 Приложение будет доступно по адресу: http://localhost:5173"
echo "🔑 Данные для входа: admin@crm.ru / admin123"
echo ""

npm run dev
