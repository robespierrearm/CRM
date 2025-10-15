import { TenderStatus } from '../types';

/**
 * Цветовая схема для статусов тендеров
 * Используется единообразно во всех компонентах
 */
export const statusColors: Record<TenderStatus, string> = {
  'Новый': 'bg-sky-500 text-white font-semibold shadow-sm',
  'Подано': 'bg-amber-500 text-white font-semibold shadow-sm',
  'Рассмотрение': 'bg-orange-500 text-white font-semibold shadow-sm',
  'Победа': 'bg-emerald-600 text-white font-semibold shadow-sm',
  'В работе': 'bg-indigo-600 text-white font-semibold shadow-sm',
  'Завершён - Оплачен': 'bg-[#E8F5E9] text-[#388E3C] font-semibold border border-[#388E3C]',
  'Проигран': 'bg-[#FFEBEE] text-[#C62828] font-semibold border border-[#C62828]',
};

/**
 * Описание цветовой логики:
 * - Новый (Голубой) - начальный этап, нейтральный цвет
 * - Подано (Янтарный) - в процессе, требует внимания
 * - Рассмотрение (Оранжевый) - активная фаза, важный момент
 * - Победа (Изумрудный) - успешный результат
 * - В работе (Индиго) - активная работа по выигранному тендеру
 * - Завершён - Оплачен (Темно-бирюзовый) - полностью завершено успешно
 * - Проигран (Розово-красный) - неуспешный результат
 */

export const getStatusColor = (status: TenderStatus): string => {
  return statusColors[status] || 'bg-gray-500 text-white';
};
