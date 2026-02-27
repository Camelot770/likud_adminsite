'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { getNewsItem, updateNews } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'politics',
    body: '',
    excerpt: '',
    imageUrl: '',
    status: 'draft',
  });

  useEffect(() => {
    loadNews();
  }, [newsId]);

  const loadNews = async () => {
    try {
      const response = await getNewsItem(newsId);
      const item = response.data;
      setForm({
        title: item.title,
        slug: item.slug,
        category: item.category,
        body: item.body,
        excerpt: item.excerpt,
        imageUrl: item.imageUrl || '',
        status: item.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Заполните заголовок и текст новости');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateNews(newsId, form);
      router.push('/dashboard/news');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/news')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редактирование новости</h1>
          <p className="text-gray-500">Изменение публикации</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <Input
                label="Заголовок"
                placeholder="Введите заголовок новости"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <Input
                label="URL-адрес (slug)"
                placeholder="url-novosti"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />

              <Textarea
                label="Краткое описание"
                placeholder="Краткое описание для превью"
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />

              <Textarea
                label="Текст новости"
                placeholder="Полный текст новости..."
                rows={15}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardTitle>Параметры</CardTitle>
              <div className="mt-4 space-y-4">
                <Select
                  label="Категория"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  options={[
                    { value: 'politics', label: 'Политика' },
                    { value: 'community', label: 'Сообщество' },
                    { value: 'culture', label: 'Культура' },
                    { value: 'events', label: 'Мероприятия' },
                    { value: 'opinion', label: 'Мнение' },
                  ]}
                />

                <Select
                  label="Статус"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[
                    { value: 'draft', label: 'Черновик' },
                    { value: 'published', label: 'Опубликовано' },
                    { value: 'archived', label: 'Архив' },
                  ]}
                />

                <Input
                  label="URL изображения"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />

                {form.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={form.imageUrl}
                      alt="Превью"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/news')}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
