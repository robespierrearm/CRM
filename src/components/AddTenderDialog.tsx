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
    name: '',
    url: '',
    status: 'Новый',
    publicationDate: new Date().toISOString().split('T')[0],
    submissionDeadline: '',
    initialPrice: undefined,
    contractSecurityPercent: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tenderData = { ...formData };

    // Валидация
    if (!tenderData.name || !tenderData.url) {
      alert('Пожалуйста, заполните название и ссылку');
      return;
    }

    // Добавляем тендер
    addTender({
      id: Date.now().toString(),
      name: tenderData.name,
      url: tenderData.url,
      status: 'Новый',
      publicationDate: tenderData.publicationDate || new Date().toISOString().split('T')[0],
      submissionDeadline: tenderData.submissionDeadline || '',
      initialPrice: tenderData.initialPrice || 0,
      contractSecurityPercent: tenderData.contractSecurityPercent || 0,
    } as Tender);

    // Сбрасываем форму
    setFormData({
      name: '',
      url: '',
      status: 'Новый',
      publicationDate: new Date().toISOString().split('T')[0],
      submissionDeadline: '',
      initialPrice: undefined,
      contractSecurityPercent: undefined,
    });

    onOpenChange(false);
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setFormData({
      name: '',
      url: '',
      status: 'Новый',
      publicationDate: new Date().toISOString().split('T')[0],
      submissionDeadline: '',
      initialPrice: undefined,
      contractSecurityPercent: undefined,
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
              <Label htmlFor="name">Название тендера *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название тендера"
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
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="publicationDate">Дата публикации</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publicationDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submissionDeadline">Дедлайн подачи</Label>
                <Input
                  id="submissionDeadline"
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) =>
                    setFormData({ ...formData, submissionDeadline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="initialPrice">Начальная цена (₽)</Label>
                <Input
                  id="initialPrice"
                  type="number"
                  value={formData.initialPrice ?? ''}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      initialPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  placeholder="Введите начальную цену"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contractSecurity">Обеспечение контракта (%)</Label>
                <Input
                  id="contractSecurity"
                  type="number"
                  value={formData.contractSecurityPercent ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractSecurityPercent: e.target.value ? parseFloat(e.target.value) : undefined,
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
