import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Expense } from '../types';
import { statusColors } from '../lib/statusColors';

export const AccountingPage: React.FC = () => {
  const { tenders, accountingEntries, updateAccountingEntry } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expenseDetailsDialog, setExpenseDetailsDialog] = useState<{ open: boolean; tenderId: string | null }>({
    open: false,
    tenderId: null,
  });

  const [newExpense, setNewExpense] = useState<{ [key: string]: { name: string; amount: string; comment: string } }>(
    {}
  );

  const wonTenders = tenders.filter(
    (t) => t.status === 'Победа' || t.status === 'В работе' || t.status === 'Завершён - Оплачен'
  );

  const filteredTenders = wonTenders.filter(t => {
    if (filter === 'active') return t.status === 'Победа' || t.status === 'В работе';
    if (filter === 'completed') return t.status === 'Завершён - Оплачен';
    return true;
  });

  const getExpenses = (tenderId: string): Expense[] => {
    const entry = accountingEntries.find((e) => e.tenderId === tenderId);
    return entry?.expenses || [];
  };

  const addExpense = (tenderId: string) => {
    const expense = newExpense[tenderId];
    if (!expense || !expense.name || !expense.amount) return;

    const currentExpenses = getExpenses(tenderId);
    const newExp: Expense = {
      id: Date.now().toString(),
      name: expense.name,
      amount: parseFloat(expense.amount),
      comment: expense.comment || '',
    };

    updateAccountingEntry({
      tenderId,
      expenses: [...currentExpenses, newExp],
    });

    setNewExpense({ ...newExpense, [tenderId]: { name: '', amount: '', comment: '' } });
  };

  const removeExpense = (tenderId: string, expenseId: string) => {
    const currentExpenses = getExpenses(tenderId);
    updateAccountingEntry({
      tenderId,
      expenses: currentExpenses.filter((e) => e.id !== expenseId),
    });
  };

  const calculateFinancials = (tenderId: string) => {
    const tender = tenders.find((t) => t.id === tenderId);
    if (!tender) return { revenue: 0, totalExpenses: 0, security: 0, netProfit: 0, tax: 0, total: 0 };

    const revenue = tender.mySubmissionPrice || 0;
    const expenses = getExpenses(tenderId);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const security = (revenue * tender.contractSecurityPercent) / 100;
    const netProfit = revenue - totalExpenses - security;
    const tax = netProfit * 0.07; // УСН 7%
    const total = netProfit - tax;

    return { revenue, totalExpenses, security, netProfit, tax, total };
  };

  const handleExpenseChange = (tenderId: string, field: 'name' | 'amount' | 'comment', value: string) => {
    const currentExpense = newExpense[tenderId] || { name: '', amount: '', comment: '' };
    setNewExpense({
      ...newExpense,
      [tenderId]: {
        ...currentExpense,
        [field]: value,
      },
    });
  };

  const openExpenseDetailsDialog = (tenderId: string) => {
    setExpenseDetailsDialog({ open: true, tenderId });
  };

  const closeExpenseDetailsDialog = () => {
    setExpenseDetailsDialog({ open: false, tenderId: null });
  };

  const handleAddExpenseFromDialog = () => {
    if (expenseDetailsDialog.tenderId) {
      addExpense(expenseDetailsDialog.tenderId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Бухгалтерия</h1>
          <p className="text-gray-500 mt-1">Финансовый учет выигранных тендеров</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Все
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            В работе
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Завершённые
          </Button>
        </div>
      </div>

      {filteredTenders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {filter === 'all' ? 'Нет выигранных тендеров для учета' : 
             filter === 'active' ? 'Нет тендеров в работе' :
             'Нет завершённых тендеров'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTenders.map((tender) => {
            const financials = calculateFinancials(tender.id);

            return (
              <Card 
                key={tender.id}
                className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow bg-white"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-6">
                    {/* Название тендера */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-1.5 h-20 rounded-full flex-shrink-0 ${
                        financials.total >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{tender.name}</h3>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs mt-2 ${statusColors[tender.status]}`}>
                          {tender.status}
                        </span>
                      </div>
                    </div>

                    {/* Финансовые показатели - выровнены по вертикали */}
                    <div className="flex-shrink-0">
                      <div className="space-y-2.5">
                        {/* Доход */}
                        <div className="flex items-center justify-between gap-8 py-1.5 border-b border-gray-100">
                          <span className="text-sm text-gray-600 font-medium w-32">Доход:</span>
                          <span className="text-sm font-bold text-green-600 text-right w-28">
                            {formatCurrency(financials.revenue)}
                          </span>
                        </div>
                        
                        {/* Расходы */}
                        <div className="flex items-center justify-between gap-8 py-1.5 border-b border-gray-100">
                          <span className="text-sm text-gray-600 font-medium w-32">Расходы:</span>
                          <span className="text-sm font-bold text-red-600 text-right w-28">
                            {formatCurrency(financials.totalExpenses)}
                          </span>
                        </div>
                        
                        {/* Прибыль */}
                        <div className="flex items-center justify-between gap-8 py-1.5 border-b border-gray-100">
                          <span className="text-sm text-gray-600 font-medium w-32">Прибыль:</span>
                          <span className="text-sm font-bold text-blue-600 text-right w-28">
                            {formatCurrency(financials.netProfit)}
                          </span>
                        </div>
                        
                        {/* Налог */}
                        <div className="flex items-center justify-between gap-8 py-1.5 border-b border-gray-100">
                          <span className="text-sm text-gray-600 font-medium w-32">Налог УСН (7%):</span>
                          <span className="text-sm font-bold text-orange-600 text-right w-28">
                            {formatCurrency(financials.tax)}
                          </span>
                        </div>
                        
                        {/* Чистая прибыль */}
                        <div className="flex items-center justify-between gap-8 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg px-3 mt-1">
                          <span className="text-sm text-gray-900 font-semibold w-32">Чистая прибыль:</span>
                          <span className={`text-base font-bold text-right w-28 ${
                            financials.total >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {formatCurrency(financials.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 whitespace-nowrap"
                        onClick={() => openExpenseDetailsDialog(tender.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                        onClick={() => openExpenseDetailsDialog(tender.id)}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Диалог управления расходами - Компактный дизайн */}
      <Dialog open={expenseDetailsDialog.open} onOpenChange={(open) => !open && closeExpenseDetailsDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          {/* Заголовок */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Управление расходами
            </DialogTitle>
            {expenseDetailsDialog.tenderId && (
              <p className="text-xs text-gray-500 mt-1">
                {tenders.find(t => t.id === expenseDetailsDialog.tenderId)?.name}
              </p>
            )}
          </div>
          
          {/* Контент с прокруткой */}
          <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
            {expenseDetailsDialog.tenderId && (
              <>
                {/* Секция: Добавить новый расход */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900">Добавить новый расход</h3>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg p-4 border border-blue-100/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Название</label>
                        <Input
                          placeholder="Материалы"
                          value={newExpense[expenseDetailsDialog.tenderId]?.name || ''}
                          onChange={(e) =>
                            handleExpenseChange(expenseDetailsDialog.tenderId!, 'name', e.target.value)
                          }
                          className="h-9 text-sm rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Сумма</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newExpense[expenseDetailsDialog.tenderId]?.amount || ''}
                          onChange={(e) =>
                            handleExpenseChange(expenseDetailsDialog.tenderId!, 'amount', e.target.value)
                          }
                          className="h-9 text-sm rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Комментарий</label>
                        <Input
                          placeholder="Описание"
                          value={newExpense[expenseDetailsDialog.tenderId]?.comment || ''}
                          onChange={(e) =>
                            handleExpenseChange(expenseDetailsDialog.tenderId!, 'comment', e.target.value)
                          }
                          className="h-9 text-sm rounded-lg"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddExpenseFromDialog}
                      className="mt-3 w-full h-9 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Добавить расход
                    </Button>
                  </div>
                </div>

                {/* Разделитель */}
                <div className="border-t border-gray-100"></div>

                {/* Секция: Список расходов */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-gray-600 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-900">Список расходов</h3>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {getExpenses(expenseDetailsDialog.tenderId).length} позиций
                    </span>
                  </div>
                  
                  {getExpenses(expenseDetailsDialog.tenderId).length > 0 ? (
                    <div className="space-y-2">
                      {getExpenses(expenseDetailsDialog.tenderId).map((expense) => (
                        <div
                          key={expense.id}
                          className="group p-3 bg-[#F8F9FC] rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900">{expense.name}</div>
                              {expense.comment && (
                                <div className="text-xs text-gray-500 mt-1">{expense.comment}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-sm font-bold text-red-600 tabular-nums">
                                -{formatCurrency(expense.amount)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                                onClick={() => removeExpense(expenseDetailsDialog.tenderId!, expense.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <div className="text-sm font-medium text-gray-500">Расходы не добавлены</div>
                      <p className="text-xs text-gray-400 mt-1">Добавьте первый расход</p>
                    </div>
                  )}
                </div>

                {/* Итоговая сумма */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Итого расходов:</span>
                    <span className="text-xl font-bold text-red-600 tabular-nums">
                      {formatCurrency(calculateFinancials(expenseDetailsDialog.tenderId).totalExpenses)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Футер - зафиксирован внизу */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex justify-center">
              <Button 
                onClick={closeExpenseDetailsDialog}
                className="px-6 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
