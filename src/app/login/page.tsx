'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { adminLogin } from '@/lib/api';
import { setToken, setRefreshToken, setAdminUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminLogin(email, password);
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      setAdminUser(response.data.admin);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-xl mb-4">
            <span className="text-white font-bold text-xl">ЛР</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ликуд RU</h1>
          <p className="text-gray-500 mt-1">Вход в панель управления</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="admin@likud-ru.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} className="w-full">
              Войти
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Ликуд на русском &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
