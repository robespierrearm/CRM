import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Неверный email или пароль');
      }
    } catch (err) {
      setError('Ошибка входа в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">CRM Управление Тендерами</CardTitle>
          <CardDescription className="text-center">
            Войдите в систему для продолжения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-center text-blue-800 font-medium mb-1">
                Данные для входа (Supabase):
              </p>
              <p className="text-sm text-center text-blue-900 font-semibold">
                admin@crm.ru
              </p>
              <p className="text-sm text-center text-blue-900 font-semibold">
                admin123
              </p>
              <p className="text-xs text-center text-blue-600 mt-1">
                Создайте пользователя в Supabase Dashboard
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
