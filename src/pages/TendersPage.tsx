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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Plus, Edit, Trash2, ExternalLink, Info, Lock } from 'lucide-react';
import { Tender, TenderStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { statusColors } from '../lib/statusColors';

type FilterType = 'new' | 'review' | 'inProgress' | 'archive' | 'all';
type ArchiveFilter = 'all' | 'completed' | 'lost';

interface TendersPageProps {
  filter?: FilterType;
}

export const TendersPage: React.FC<TendersPageProps> = ({ filter = 'all' }) => {
  const { tenders, addTender, updateTender, deleteTender, addReminder, reminders, deleteReminder } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalType, setStatusModalType] = useState<'submitted' | 'lost' | null>(null);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('all');
  
  const [statusChangeData, setStatusChangeData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    mySubmissionPrice: 0,
    winnerPrice: 0,
  });

  const [formData, setFormData] = useState<Partial<Tender>>({
    name: '',
    url: '',
    status: 'Новый',
    publicationDate: '',
    submissionDeadline: '',
    initialPrice: 0,
    contractSecurityPercent: 0,
  });

  // Проверка, заблокированы ли поля цен
  const isPriceLocked = (tender: Tender) => {
    return tender.status !== 'Новый';
  };

  const handleOpenDialog = (tender?: Tender) => {
    if (tender) {
      setEditingTender(tender);
      setFormData(tender);
    } else {
      setEditingTender(null);
      setFormData({
        name: '',
        url: '',
        status: 'Новый',
        publicationDate: new Date().toISOString().split('T')[0],
        submissionDeadline: '',
        initialPrice: 0,
        contractSecurityPercent: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTender(null);
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as TenderStatus;
    
    // Если меняем на "Подано", открываем модалку
    if (newStatus === 'Подано' && formData.status === 'Новый') {
      setStatusModalType('submitted');
      setIsStatusModalOpen(true);
      setStatusChangeData({
        submissionDate: new Date().toISOString().split('T')[0],
        mySubmissionPrice: formData.initialPrice || 0,
        winnerPrice: 0,
      });
    }
    // Если меняем на "Проигран", открываем модалку
    else if (newStatus === 'Проигран') {
      setStatusModalType('lost');
      setIsStatusModalOpen(true);
      setStatusChangeData({
        submissionDate: formData.submissionDate || new Date().toISOString().split('T')[0],
        mySubmissionPrice: formData.mySubmissionPrice || 0,
        winnerPrice: 0,
      });
    }
    // Если меняем на "Победа", оставляем статус "Победа" (не меняем автоматически)
    else if (newStatus === 'Победа') {
      setFormData({ 
        ...formData, 
        status: 'Победа',
      });
    }
    else {
      setFormData({ ...formData, status: newStatus });
    }
  };

  const handleStatusModalSubmit = () => {
    if (statusModalType === 'submitted') {
      // Удаляем напоминание для этого тендера
      if (editingTender) {
        const reminder = reminders.find(r => r.tenderId === editingTender.id);
        if (reminder) {
          deleteReminder(reminder.id);
        }
        
        // Сохраняем тендер с новым статусом и данными
        updateTender(editingTender.id, {
          ...formData,
          status: 'Рассмотрение',
          submissionDate: statusChangeData.submissionDate,
          mySubmissionPrice: statusChangeData.mySubmissionPrice,
        });
        
        // Закрываем все окна
        setIsStatusModalOpen(false);
        setStatusModalType(null);
        handleCloseDialog();
      }
    } else if (statusModalType === 'lost') {
      if (editingTender) {
        // Сохраняем тендер со статусом "Проигран"
        updateTender(editingTender.id, {
          ...formData,
          status: 'Проигран',
          winnerPrice: statusChangeData.winnerPrice || undefined,
        });
        
        // Закрываем все окна
        setIsStatusModalOpen(false);
        setStatusModalType(null);
        handleCloseDialog();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tenderData = { ...formData };

    if (editingTender) {
      updateTender(editingTender.id, tenderData);
      
      // Если статус изменился на "Подано", удаляем напоминание
      if (tenderData.status === 'Подано' && editingTender.status === 'Новый') {
        const reminder = reminders.find(r => r.tenderId === editingTender.id);
        if (reminder) {
          deleteReminder(reminder.id);
        }
      }
    } else {
      const newTender = addTender(tenderData as Omit<Tender, 'id'>);
      
      // Если создаем тендер со статусом "Новый", создаем напоминание
      if (tenderData.status === 'Новый' && tenderData.submissionDeadline) {
        addReminder({
          tenderId: newTender.id,
          type: 'Подача заявки',
          dateTime: new Date(tenderData.submissionDeadline).toISOString().slice(0, 16),
          description: `Дедлайн подачи заявки на тендер: ${tenderData.name}`,
          completed: false,
        });
      }
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот тендер?')) {
      // Удаляем связанные напоминания
      const relatedReminders = reminders.filter(r => r.tenderId === id);
      relatedReminders.forEach(r => deleteReminder(r.id));
      
      deleteTender(id);
    }
  };

  const calculateSecurityAmount = (price: number, percent: number) => {
    return (price * percent) / 100;
  };

  const getAvailableStatuses = (currentStatus: TenderStatus): TenderStatus[] => {
    switch (currentStatus) {
      case 'Новый':
        return ['Новый', 'Подано'];
      case 'Подано':
        return ['Подано', 'Рассмотрение'];
      case 'Рассмотрение':
        return ['Рассмотрение', 'Победа', 'Проигран'];
      case 'Победа':
        return ['Победа', 'В работе'];
      case 'В работе':
        return ['В работе', 'Завершён - Оплачен'];
      case 'Завершён - Оплачен':
        return ['Завершён - Оплачен'];
      case 'Проигран':
        return ['Проигран'];
      default:
        return [currentStatus];
    }
  };

  // Фильтрация тендеров по фильтру
  const getFilteredTenders = () => {
    let filtered = tenders;

    switch (filter) {
      case 'new':
        filtered = tenders.filter(t => t.status === 'Новый');
        break;
      case 'review':
        filtered = tenders.filter(t => t.status === 'Подано' || t.status === 'Рассмотрение');
        break;
      case 'inProgress':
        filtered = tenders.filter(t => t.status === 'Победа' || t.status === 'В работе');
        break;
      case 'archive':
        filtered = tenders.filter(t => t.status === 'Завершён - Оплачен' || t.status === 'Проигран');
        // Применяем фильтр архива
        if (archiveFilter === 'completed') {
          filtered = filtered.filter(t => t.status === 'Завершён - Оплачен');
        } else if (archiveFilter === 'lost') {
          filtered = filtered.filter(t => t.status === 'Проигран');
        }
        break;
      case 'all':
      default:
        filtered = tenders;
        break;
    }

    return filtered;
  };

  const filteredTenders = getFilteredTenders().sort((a, b) => {
    // Сортируем по ID в обратном порядке (новые сверху)
    return parseInt(b.id) - parseInt(a.id);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Тендеры</h1>
          <p className="text-gray-500 mt-1">Управление тендерами и заявками</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить тендер
        </Button>
      </div>

      {/* Фильтры для архива */}
      {filter === 'archive' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Фильтр:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setArchiveFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                archiveFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setArchiveFilter('completed')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                archiveFilter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Оконченные
            </button>
            <button
              onClick={() => setArchiveFilter('lost')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                archiveFilter === 'lost'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Проигрыш
            </button>
          </div>
        </div>
      )}

      {/* Tenders Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Название</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ссылка</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Даты</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Начальная цена
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Моя цена
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Обеспечение
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTenders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Нет тендеров в этой категории.
                </td>
              </tr>
            ) : (
              filteredTenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{tender.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={tender.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      Открыть <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[tender.status]
                      }`}
                    >
                      {tender.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        Публ: {formatDate(tender.publicationDate)}
                      </div>
                      {tender.submissionDeadline && (
                        <div className="text-xs text-gray-500">
                          Дедлайн: {formatDate(tender.submissionDeadline)}
                        </div>
                      )}
                      {tender.submissionDate && (
                        <div className="text-xs text-gray-500">
                          Подача: {formatDate(tender.submissionDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {formatCurrency(tender.initialPrice)}
                      {isPriceLocked(tender) && <Lock className="h-3 w-3 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tender.mySubmissionPrice ? (
                      <div className="flex items-center gap-1">
                        {formatCurrency(tender.mySubmissionPrice)}
                        <Lock className="h-3 w-3 text-gray-400" />
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1 cursor-help">
                            {tender.contractSecurityPercent}%
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {formatCurrency(
                              calculateSecurityAmount(
                                tender.mySubmissionPrice || tender.initialPrice,
                                tender.contractSecurityPercent
                              )
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(tender)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tender.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTender ? 'Редактировать тендер' : 'Добавить тендер'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию о тендере
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название тендера *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">Ссылка на тендер *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Статус *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStatuses(formData.status || 'Новый').map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="publicationDate">Дата публикации *</Label>
                  <Input
                    id="publicationDate"
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {formData.status === 'Новый' && (
                <div className="grid gap-2">
                  <Label htmlFor="submissionDeadline">Дедлайн подачи заявки</Label>
                  <Input
                    id="submissionDeadline"
                    type="date"
                    value={formData.submissionDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, submissionDeadline: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="initialPrice" className="flex items-center gap-2">
                  Начальная цена (₽) *
                  {editingTender && isPriceLocked(editingTender) && (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </Label>
                <Input
                  id="initialPrice"
                  type="number"
                  value={formData.initialPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, initialPrice: Number(e.target.value) })
                  }
                  disabled={editingTender ? isPriceLocked(editingTender) : false}
                  className={editingTender && isPriceLocked(editingTender) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  required
                />
              </div>

              {formData.mySubmissionPrice !== undefined && formData.mySubmissionPrice > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="mySubmissionPrice" className="flex items-center gap-2">
                    Моя цена подачи (₽)
                    <Lock className="h-3 w-3 text-gray-400" />
                  </Label>
                  <Input
                    id="mySubmissionPrice"
                    type="number"
                    value={formData.mySubmissionPrice}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}

              {formData.status === 'Проигран' && formData.winnerPrice !== undefined && (
                <div className="grid gap-2">
                  <Label htmlFor="winnerPrice">Цена победителя (₽)</Label>
                  <Input
                    id="winnerPrice"
                    type="number"
                    value={formData.winnerPrice}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="contractSecurity">Обеспечение контракта (%)</Label>
                <Input
                  id="contractSecurity"
                  type="number"
                  step="0.1"
                  value={formData.contractSecurityPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, contractSecurityPercent: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">
                {editingTender ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal - Submitted */}
      <Dialog open={isStatusModalOpen && statusModalType === 'submitted'} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подача заявки</DialogTitle>
            <DialogDescription>
              Укажите данные о подаче заявки
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="submissionDate">Дата подачи заявки *</Label>
              <Input
                id="submissionDate"
                type="date"
                value={statusChangeData.submissionDate}
                onChange={(e) =>
                  setStatusChangeData({ ...statusChangeData, submissionDate: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mySubmissionPrice">Моя цена подачи (₽) *</Label>
              <Input
                id="mySubmissionPrice"
                type="number"
                value={statusChangeData.mySubmissionPrice}
                onChange={(e) =>
                  setStatusChangeData({ ...statusChangeData, mySubmissionPrice: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleStatusModalSubmit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal - Lost */}
      <Dialog open={isStatusModalOpen && statusModalType === 'lost'} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Тендер проигран</DialogTitle>
            <DialogDescription>
              Укажите цену победителя (необязательно)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="winnerPrice">Цена победителя (₽)</Label>
              <Input
                id="winnerPrice"
                type="number"
                value={statusChangeData.winnerPrice}
                onChange={(e) =>
                  setStatusChangeData({ ...statusChangeData, winnerPrice: Number(e.target.value) })
                }
                placeholder="На сколько снизились"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleStatusModalSubmit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
