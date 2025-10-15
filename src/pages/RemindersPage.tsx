import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Check, Clock, Calendar, Trash2 } from 'lucide-react';
import { Reminder } from '../types';
import { formatDateTime } from '../lib/utils';
import { cn } from '../lib/utils';

export const RemindersPage: React.FC = () => {
  const { reminders, tenders, addReminder, updateReminder, deleteReminder } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Reminder>>({
    tenderId: '',
    type: 'Другое',
    dateTime: '',
    description: '',
    completed: false,
  });

  // Показываем только тендеры со статусом "Новый" для выбора
  const availableTenders = tenders.filter(t => t.status === 'Новый');

  const handleOpenDialog = () => {
    setFormData({
      tenderId: '',
      type: 'Другое',
      dateTime: new Date().toISOString().slice(0, 16),
      description: '',
      completed: false,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReminder(formData as Omit<Reminder, 'id'>);
    handleCloseDialog();
  };

  const handleToggleComplete = (reminder: Reminder) => {
    updateReminder(reminder.id, { completed: !reminder.completed });
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это напоминание?')) {
      deleteReminder(id);
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  const upcomingReminders = sortedReminders.filter((r) => !r.completed);
  const completedReminders = sortedReminders.filter((r) => r.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Напоминания</h1>
          <p className="text-gray-500 mt-1">Управление напоминаниями и событиями</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить напоминание
        </Button>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Предстоящие ({upcomingReminders.length})
        </h2>
        {upcomingReminders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Нет предстоящих напоминаний
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const tender = tenders.find((t) => t.id === reminder.tenderId);
              const isPast = new Date(reminder.dateTime) < new Date();

              return (
                <Card
                  key={reminder.id}
                  className={cn(
                    'hover:shadow-md transition-shadow',
                    isPast && 'border-red-200 bg-red-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Calendar className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">
                          {tender?.name || 'Тендер не найден'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded',
                              isPast
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            )}
                          >
                            {formatDateTime(reminder.dateTime)}
                          </span>
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {reminder.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleComplete(reminder)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Выполнено
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Выполненные ({completedReminders.length})
          </h2>
          <div className="space-y-3">
            {completedReminders.map((reminder) => {
              const tender = tenders.find((t) => t.id === reminder.tenderId);

              return (
                <Card key={reminder.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-through">
                          {tender?.name || 'Тендер не найден'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(reminder.dateTime)}
                          </span>
                          <span className="text-xs text-gray-500">{reminder.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleComplete(reminder)}
                        >
                          Вернуть
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Добавить напоминание</DialogTitle>
              <DialogDescription>
                Создайте новое напоминание для тендера
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tender">Связанный тендер *</Label>
                <Select
                  value={formData.tenderId}
                  onValueChange={(value) => setFormData({ ...formData, tenderId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тендер" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTenders.map((tender) => (
                      <SelectItem key={tender.id} value={tender.id}>
                        {tender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Тип события *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Подача заявки">Подача заявки</SelectItem>
                    <SelectItem value="Рассмотрение">Рассмотрение</SelectItem>
                    <SelectItem value="Другое">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateTime">Дата и время *</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Описание *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание события"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
