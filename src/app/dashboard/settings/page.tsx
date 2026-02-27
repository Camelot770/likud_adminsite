'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getAdmins, createAdmin, deactivateAdmin, activateAdmin } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Plus, UserCheck, UserX, Shield } from 'lucide-react';

interface AdminRow {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin',
  });

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdmins();
      setAdmins(response.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleCreate = async () => {
    if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
      setError('Заполните все поля');
      return;
    }
    if (newAdmin.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await createAdmin(newAdmin);
      setShowCreate(false);
      setNewAdmin({ email: '', name: '', password: '', role: 'admin' });
      loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (admin: AdminRow) => {
    const action = admin.isActive ? 'деактивировать' : 'активировать';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} администратора ${admin.name}?`)) return;

    try {
      if (admin.isActive) {
        await deactivateAdmin(admin.id);
      } else {
        await activateAdmin(admin.id);
      }
      loadAdmins();
    } catch (err) {
      console.error('Ошибка обновления:', err);
    }
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case 'superadmin': return <Badge variant="danger">Суперадмин</Badge>;
      case 'admin': return <Badge variant="info">Администратор</Badge>;
      case 'moderator': return <Badge variant="default">Модератор</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-500 mt-1">Управление администраторами</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить администратора
        </Button>
      </div>

      {/* Admins Table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{roleBadge(admin.role)}</TableCell>
                  <TableCell>
                    {admin.isActive ? (
                      <Badge variant="success">Активен</Badge>
                    ) : (
                      <Badge variant="danger">Деактивирован</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin ? formatDateTime(admin.lastLogin) : 'Нет данных'}
                  </TableCell>
                  <TableCell>{formatDate(admin.createdAt)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(admin)}
                      className={`p-1.5 rounded-lg ${
                        admin.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={admin.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                      {admin.isActive ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-400" colSpan={7}>
                    Администраторы не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Admin Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setError('');
        }}
        title="Новый администратор"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Имя"
            placeholder="Имя администратора"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="admin@likud-ru.org"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            required
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 8 символов"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            required
          />

          <Select
            label="Роль"
            value={newAdmin.role}
            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Администратор' },
              { value: 'moderator', label: 'Модератор' },
              { value: 'superadmin', label: 'Суперадмин' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setError('');
              }}
            >
              Отмена
            </Button>
            <Button loading={creating} onClick={handleCreate}>
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
