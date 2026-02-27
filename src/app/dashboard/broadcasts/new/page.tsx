'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { createBroadcast, sendBroadcast } from '@/lib/api';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';

export default function NewBroadcastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    channel: 'telegram',
    segment: 'all',
  });

  const handleSubmit = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      setError('Заполните название и текст рассылки');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createBroadcast(form);
      if (sendImmediately && response.data) {
        const broadcastData = response.data as { id: string };
        await sendBroadcast(broadcastData.id);
      }
      router.push('/dashboard/broadcasts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/broadcasts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новая рассылка</h1>
          <p className="text-gray-500">Создание уведомления</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <Input
                label="Название рассылки"
                placeholder="Введите название"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Текст сообщения (Markdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showPreview ? 'Редактор' : 'Предпросмотр'}
                  </button>
                </div>

                {showPreview ? (
                  <div
                    className="min-h-[200px] p-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(form.body) || '<span class="text-gray-400">Текст сообщения...</span>',
                    }}
                  />
                ) : (
                  <textarea
                    placeholder="Текст сообщения... Поддерживается **жирный**, *курсив*, `код`"
                    rows={10}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none font-mono"
                    required
                  />
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Параметры</CardTitle>
              <div className="mt-4 space-y-4">
                <Select
                  label="Канал"
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  options={[
                    { value: 'telegram', label: 'Telegram' },
                    { value: 'email', label: 'Email' },
                    { value: 'push', label: 'Push-уведомление' },
                    { value: 'all', label: 'Все каналы' },
                  ]}
                />

                <Select
                  label="Сегмент аудитории"
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  options={[
                    { value: 'all', label: 'Все пользователи' },
                    { value: 'active', label: 'Активные пользователи' },
                    { value: 'new', label: 'Новые пользователи (< 30 дней)' },
                    { value: 'inactive', label: 'Неактивные' },
                    { value: 'tel_aviv', label: 'Тель-Авив' },
                    { value: 'jerusalem', label: 'Иерусалим' },
                    { value: 'haifa', label: 'Хайфа' },
                  ]}
                />
              </div>
            </Card>

            <div className="space-y-3">
              <Button type="submit" loading={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Сохранить черновик
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={loading}
                className="w-full"
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Сохранить и отправить
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/broadcasts')}
                className="w-full"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
