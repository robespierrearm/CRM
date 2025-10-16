import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tender } from '../types';

interface AddTenderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTenderDialog: React.FC<AddTenderDialogProps> = ({ open, onOpenChange }) => {
  const { addTender } = useData();
  
  const [formData, setFormData] = useState<Partial<Tender>>({
    title: '',
    link: '',
    status: 'Новый',
    publish_date: new Date().toISOString().split('T')[0],
    deadline: '',
    amount: null,
    contract_guarantee_percent: null,
    is_archived: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tenderData = { ...formData };

    // Валидация
    if (!tenderData.title || !tenderData.link) {
      alert('Пожалуйста, заполните название и ссылку');
      return;
    }

    // Добавляем тендер
    addTender({
      title: tenderData.title,
      link: tenderData.link,
      status: 'Новый',
      publish_date: tenderData.publish_date || new Date().toISOString().split('T')[0],
      deadline: tenderData.deadline || null,
      amount: tenderData.amount || null,
      contract_guarantee_percent: tenderData.contract_guarantee_percent || null,
      is_archived: false,
    } as Omit<Tender, 'id' | 'user_id' | 'created_at' | 'updated_at'>);

    // Сбрасываем форму
    setFormData({
      title: '',
      link: '',
      status: 'Новый',
      publish_date: new Date().toISOString().split('T')[0],
      deadline: '',
      amount: null,
      contract_guarantee_percent: null,
      is_archived: false,
    });

    onOpenChange(false);
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setFormData({
      title: '',
      link: '',
      status: 'Новый',
      publish_date: new Date().toISOString().split('T')[0],
      deadline: '',
      amount: null,
      contract_guarantee_percent: null,
      is_archived: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить тендер</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом тендере
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Название тендера *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название тендера"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Ссылка на тендер *</Label>
              <Input
                id="link"
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="publish_date">Дата публикации</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, publish_date: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deadline">Дедлайн подачи</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Начальная цена (₽)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount ?? ''}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      amount: e.target.value ? parseFloat(e.target.value) : null 
                    })
                  }
                  placeholder="Введите начальную цену"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contract_guarantee_percent">Обеспечение контракта (%)</Label>
                <Input
                  id="contract_guarantee_percent"
                  type="number"
                  value={formData.contract_guarantee_percent ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contract_guarantee_percent: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Введите процент обеспечения"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
