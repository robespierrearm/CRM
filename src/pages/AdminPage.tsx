import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Building, Save, Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { CompanyInfo, User } from '../types';

export const AdminPage: React.FC = () => {
  const { companyInfo, updateCompanyInfo } = useData();
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [editedCompanyInfo, setEditedCompanyInfo] = useState<CompanyInfo>(companyInfo);
  const [isSaving, setIsSaving] = useState(false);
  
  // User management state
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    username: '',
    password: '',
    role: 'user',
  });

  const handleSaveCompanyInfo = () => {
    setIsSaving(true);
    updateCompanyInfo(editedCompanyInfo);
    setTimeout(() => {
      setIsSaving(false);
      alert('Реквизиты компании сохранены');
    }, 500);
  };

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        username: user.username,
        password: user.password,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        username: '',
        password: '',
        role: 'user',
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({
      username: '',
      password: '',
      role: 'user',
    });
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userFormData.username || !userFormData.password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, userFormData);
      alert('Пользователь обновлен');
    } else {
      addUser(userFormData as Omit<User, 'id'>);
      alert('Пользователь добавлен');
    }

    handleCloseUserDialog();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
        <p className="text-gray-500 mt-1">Управление настройками системы</p>
      </div>

      <div className="grid gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Реквизиты компании
            </CardTitle>
            <CardDescription>Редактирование информации о компании</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Название компании</Label>
              <Input
                id="companyName"
                value={editedCompanyInfo.name}
                onChange={(e) =>
                  setEditedCompanyInfo({ ...editedCompanyInfo, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="inn">ИНН</Label>
                <Input
                  id="inn"
                  value={editedCompanyInfo.inn}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, inn: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kpp">КПП</Label>
                <Input
                  id="kpp"
                  value={editedCompanyInfo.kpp || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, kpp: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ogrn">ОГРН</Label>
              <Input
                id="ogrn"
                value={editedCompanyInfo.ogrn || ''}
                onChange={(e) =>
                  setEditedCompanyInfo({ ...editedCompanyInfo, ogrn: e.target.value })
                }
                placeholder="Необязательно"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="directorName">ФИО Директора</Label>
              <Input
                id="directorName"
                value={editedCompanyInfo.directorName || ''}
                onChange={(e) =>
                  setEditedCompanyInfo({ ...editedCompanyInfo, directorName: e.target.value })
                }
                placeholder="Необязательно"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={editedCompanyInfo.phone || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, phone: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedCompanyInfo.email || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, email: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={editedCompanyInfo.address || ''}
                onChange={(e) =>
                  setEditedCompanyInfo({ ...editedCompanyInfo, address: e.target.value })
                }
                placeholder="Необязательно"
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Банковские реквизиты</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="bankName">Название банка</Label>
                <Input
                  id="bankName"
                  value={editedCompanyInfo.bankName || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, bankName: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bik">БИК</Label>
                <Input
                  id="bik"
                  value={editedCompanyInfo.bik || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, bik: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="checkingAccount">Расчётный счёт</Label>
                <Input
                  id="checkingAccount"
                  value={editedCompanyInfo.checkingAccount || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, checkingAccount: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="correspondentAccount">Корреспондентский счёт</Label>
                <Input
                  id="correspondentAccount"
                  value={editedCompanyInfo.correspondentAccount || ''}
                  onChange={(e) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, correspondentAccount: e.target.value })
                  }
                  placeholder="Необязательно"
                />
              </div>
            </div>

            <Button onClick={handleSaveCompanyInfo} disabled={isSaving} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Управление пользователями
                </CardTitle>
                <CardDescription>
                  Добавление, редактирование и удаление пользователей системы
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenUserDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      user.role === 'admin' ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        {currentUser?.id === user.id && ' (Вы)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenUserDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {currentUser?.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о системе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Версия</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-500">Тип базы данных</p>
                <p className="font-medium">LocalStorage</p>
              </div>
              <div>
                <p className="text-gray-500">Последнее обновление</p>
                <p className="font-medium">{new Date().toLocaleDateString('ru-RU')}</p>
              </div>
              <div>
                <p className="text-gray-500">Статус</p>
                <p className="font-medium text-green-600">Работает</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitUser} className="space-y-4">
            <div>
              <Label htmlFor="username">
                Логин (Email) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                type="email"
                value={userFormData.username || ''}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">
                Пароль <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="text"
                value={userFormData.password || ''}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder="Введите пароль"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {editingUser ? 'Оставьте текущий пароль или введите новый' : 'Минимум 6 символов'}
              </p>
            </div>

            <div>
              <Label htmlFor="role">Роль</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value as 'admin' | 'user' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Администраторы имеют полный доступ к системе
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseUserDialog}>
                Отмена
              </Button>
              <Button type="submit">
                {editingUser ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
