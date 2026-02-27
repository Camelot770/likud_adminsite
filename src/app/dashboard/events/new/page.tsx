'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { createEvent } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    address: '',
    imageUrl: '',
    maxAttendees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setError('Заполните название, дату и место проведения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createEvent({
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        location: form.location,
        address: form.address || undefined,
        imageUrl: form.imageUrl || undefined,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees, 10) : undefined,
      });
      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новое мероприятие</h1>
          <p className="text-gray-500">Создание мероприятия</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <Input
                label="Название мероприятия"
                placeholder="Введите название"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <Textarea
                label="Описание"
                placeholder="Подробное описание мероприятия..."
                rows={8}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Дата и время начала"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
                <Input
                  label="Дата и время окончания"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Место и участники</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  label="Место проведения"
                  placeholder="Название места"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />

                <Input
                  label="Адрес"
                  placeholder="Полный адрес"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />

                <Input
                  label="Максимум участников"
                  type="number"
                  placeholder="0 = без ограничения"
                  value={form.maxAttendees}
                  onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                />

                <Input
                  label="URL изображения"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/events')}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Создать
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
