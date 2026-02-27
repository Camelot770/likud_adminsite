'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea, Select } from '@/components/ui/input';
import { getUser, updateUser, deleteUser } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, Mail, Phone, MapPin, Calendar, Tag } from 'lucide-react';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  source: string;
  status: string;
  notes: string;
  createdAt: string;
  events: Array<{ id: string; title: string; date: string }>;
  pollVotes: Array<{ id: string; question: string; answer: string }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    status: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await getUser(userId);
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        city: response.data.city,
        status: response.data.status,
        notes: response.data.notes || '',
        tags: response.data.tags.join(', '),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(userId, {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      await loadUser();
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await deleteUser(userId);
      router.push('/dashboard/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
    );
  }

  if (!user) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Активен</Badge>;
      case 'inactive': return <Badge variant="default">Неактивен</Badge>;
      case 'blocked': return <Badge variant="danger">Заблокирован</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/users')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">Карточка пользователя</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="ghost" onClick={() => setEditMode(false)}>
                Отмена
              </Button>
              <Button loading={saving} onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setEditMode(true)}>
                Редактировать
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardTitle>Информация</CardTitle>
          {editMode ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Телефон"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Город"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <Select
                label="Статус"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Активен' },
                  { value: 'inactive', label: 'Неактивен' },
                  { value: 'blocked', label: 'Заблокирован' },
                ]}
              />
              <Input
                label="Теги (через запятую)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <Textarea
                label="Заметки"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{user.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {user.tags.map((tag) => (
                    <Badge key={tag} variant="info">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Статус:</span>
                {statusBadge(user.status)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Источник:</span>
                <span>{user.source}</span>
              </div>
              {user.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Заметки:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{user.notes}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Activity */}
        <div className="space-y-6">
          <Card>
            <CardTitle>Мероприятия</CardTitle>
            <div className="mt-3 space-y-2">
              {user.events.length > 0 ? (
                user.events.map((event) => (
                  <div key={event.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Не участвовал</p>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Голоса в опросах</CardTitle>
            <div className="mt-3 space-y-2">
              {user.pollVotes.length > 0 ? (
                user.pollVotes.map((vote) => (
                  <div key={vote.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{vote.question}</p>
                    <p className="text-xs text-gray-500">Ответ: {vote.answer}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Не голосовал</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
