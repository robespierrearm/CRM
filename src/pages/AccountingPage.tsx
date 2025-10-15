import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  CheckCircle2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Expense, Tender } from '../types';
import { statusColors } from '../lib/statusColors';

const TAX_RATE = 0.07; // УСН 7%

interface TenderFinancials {
  revenue: number;
  totalExpenses: number;
  profit: number;
  tax: number;
  netProfit: number;
  margin: number;
}

export const AccountingPage: React.FC = () => {
  const { tenders, accountingEntries, updateAccountingEntry } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTenders, setExpandedTenders] = useState<Set<string>>(new Set());
  const [expenseDialog, setExpenseDialog] = useState<{
    open: boolean;
    tenderId: string | null;
  }>({ open: false, tenderId: null });
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Фильтрация тендеров
  const wonTenders = tenders.filter(
    (t) => t.status === 'Победа' || t.status === 'В работе' || t.status === 'Завершён - Оплачен'
  );

  const filteredTenders = useMemo(() => {
    let result = wonTenders;

    // Фильтр по статусу
    if (filter === 'active') {
      result = result.filter((t) => t.status === 'Победа' || t.status === 'В работе');
    } else if (filter === 'completed') {
      result = result.filter((t) => t.status === 'Завершён - Оплачен');
    }

    // Поиск
    if (searchQuery.trim()) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Сортируем по ID в обратном порядке (новые сверху)
    return result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [wonTenders, filter, searchQuery]);

  // Получение расходов для тендера
  const getExpenses = (tenderId: string): Expense[] => {
    const entry = accountingEntries.find((e) => e.tenderId === tenderId);
    return entry?.expenses || [];
  };

  // Расчет финансовых показателей для тендера
  const calculateFinancials = (tender: Tender): TenderFinancials => {
    const revenue = tender.mySubmissionPrice || 0;
    const expenses = getExpenses(tender.id);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = revenue - totalExpenses;
    const tax = profit > 0 ? profit * TAX_RATE : 0;
    const netProfit = profit - tax;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, totalExpenses, profit, tax, netProfit, margin };
  };

  // Общая статистика
  const totalStats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalTax = 0;
    let totalNetProfit = 0;

    filteredTenders.forEach((tender) => {
      const financials = calculateFinancials(tender);
      totalRevenue += financials.revenue;
      totalExpenses += financials.totalExpenses;
      totalProfit += financials.profit;
      totalTax += financials.tax;
      totalNetProfit += financials.netProfit;
    });

    return { totalRevenue, totalExpenses, totalProfit, totalTax, totalNetProfit };
  }, [filteredTenders]);

  // Переключение раскрытия карточки
  const toggleExpand = (tenderId: string) => {
    setExpandedTenders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tenderId)) {
        newSet.delete(tenderId);
      } else {
        newSet.add(tenderId);
      }
      return newSet;
    });
  };

  // Открытие диалога добавления расхода
  const openExpenseDialog = (tenderId: string) => {
    setExpenseDialog({ open: true, tenderId });
    setExpenseForm({
      name: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Закрытие диалога
  const closeExpenseDialog = () => {
    setExpenseDialog({ open: false, tenderId: null });
    setExpenseForm({
      name: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Добавление расхода
  const handleAddExpense = () => {
    if (!expenseDialog.tenderId || !expenseForm.name || !expenseForm.amount) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const currentExpenses = getExpenses(expenseDialog.tenderId);
    const newExpense: Expense = {
      id: Date.now().toString(),
      name: expenseForm.name,
      amount: parseFloat(expenseForm.amount),
      comment: expenseForm.description || '',
    };

    updateAccountingEntry({
      tenderId: expenseDialog.tenderId,
      expenses: [...currentExpenses, newExpense],
    });

    closeExpenseDialog();
  };

  // Удаление расхода
  const handleDeleteExpense = (tenderId: string, expenseId: string) => {
    if (!confirm('Удалить этот расход?')) return;

    const currentExpenses = getExpenses(tenderId);
    const updatedExpenses = currentExpenses.filter((e) => e.id !== expenseId);

    updateAccountingEntry({
      tenderId,
      expenses: updatedExpenses,
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Бухгалтерия</h1>
        <p className="text-gray-500 mt-2">Финансовый учет по выигранным тендерам</p>
      </motion.div>

      {/* Статистика - 5 карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Доход */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-200 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Доход</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totalStats.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Расходы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-white hover:border-red-200 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Расходы</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(totalStats.totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Прибыль */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-200 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Прибыль</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(totalStats.totalProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Налог УСН */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white hover:border-amber-200 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Налог УСН 7%</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(totalStats.totalTax)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Чистая прибыль */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-2 border-green-400 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                    <p className="text-xs font-semibold text-white uppercase tracking-wide">Чистая прибыль</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(totalStats.totalNetProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Фильтры и поиск */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        {/* Вкладки фильтров */}
        <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              filter === 'active'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            В работе
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              filter === 'completed'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Завершённые
          </button>
        </div>

        {/* Поиск */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию тендера..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
      </motion.div>

      {/* Список тендеров */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTenders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">Нет тендеров для отображения</p>
            </motion.div>
          ) : (
            filteredTenders.map((tender, index) => {
              const financials = calculateFinancials(tender);
              const isExpanded = expandedTenders.has(tender.id);
              const expenses = getExpenses(tender.id);

              return (
                <motion.div
                  key={tender.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
                    <CardContent className="p-6">
                      {/* Основная информация */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleExpand(tender.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {tender.name}
                            </h3>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                                statusColors[tender.status]
                              }`}
                            >
                              {tender.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openExpenseDialog(tender.id);
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Добавить расход
                            </Button>
                            <div className="flex items-center text-gray-400">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Раскрывающаяся часть с финансами и расходами */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Финансовые показатели */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                                    Финансовые показатели
                                  </h4>
                                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 max-w-2xl">
                                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Доход</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-700">
                                      {formatCurrency(financials.revenue)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-red-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Расходы</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600">
                                      {formatCurrency(financials.totalExpenses)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-emerald-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Прибыль</span>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-600">
                                      {formatCurrency(financials.profit)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-amber-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Percent className="h-5 w-5 text-amber-600" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Налог УСН (7%)</span>
                                    </div>
                                    <span className="text-lg font-bold text-amber-600">
                                      {formatCurrency(financials.tax)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                      </div>
                                      <span className="text-sm font-semibold text-gray-800">Чистая прибыль</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-700">
                                      {formatCurrency(financials.netProfit)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <Percent className="h-5 w-5 text-indigo-600" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Маржинальность</span>
                                    </div>
                                    <span className="text-lg font-bold text-indigo-600">
                                      {financials.margin.toFixed(1)}%
                                    </span>
                                  </div>
                                  </div>
                                </div>

                                {/* Детализация расходов */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                                    Детализация расходов
                                  </h4>

                                {expenses.length === 0 ? (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 mb-4">Расходов пока нет</p>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openExpenseDialog(tender.id);
                                      }}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Добавить первый расход
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Название</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Описание</th>
                                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Сумма</th>
                                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {expenses.map((expense) => (
                                          <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                              {expense.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {expense.comment || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">
                                              {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              <Button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteExpense(tender.id, expense.id);
                                                }}
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Модальное окно добавления расхода */}
      <Dialog open={expenseDialog.open} onOpenChange={closeExpenseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Добавить расход</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="expense-name" className="text-sm font-medium text-gray-700">
                Название расхода <span className="text-red-600">*</span>
              </Label>
              <Input
                id="expense-name"
                value={expenseForm.name}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, name: e.target.value })
                }
                placeholder="Например: Закупка материалов"
                className="mt-1.5 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="expense-description" className="text-sm font-medium text-gray-700">
                Описание <span className="text-gray-400 text-xs">(необязательно)</span>
              </Label>
              <Input
                id="expense-description"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
                placeholder="Например: Закупка материалов для проекта"
                className="mt-1.5 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="expense-amount" className="text-sm font-medium text-gray-700">
                Сумма <span className="text-red-600">*</span>
              </Label>
              <Input
                id="expense-amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                placeholder="0.00"
                className="mt-1.5 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="expense-date" className="text-sm font-medium text-gray-700">
                Дата
              </Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeExpenseDialog}
              className="border-gray-300"
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
