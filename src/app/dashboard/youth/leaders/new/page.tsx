'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { createYouthLeader } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewYouthLeaderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Введите имя лидера');
      return;
    }
    if (!position.trim()) {
      setError('Введите должность');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createYouthLeader({
        name: name.trim(),
        position: position.trim(),
        photo_url: photoUrl.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      router.push('/dashboard/youth');
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
          onClick={() => router.push('/dashboard/youth')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новый лидер</h1>
          <p className="text-gray-500">Добавление молодёжного лидера</p>
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
            <div className="space-y-6">
              <Input
                label="Имя"
                placeholder="Введите имя лидера..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Должность"
                placeholder="Введите должность..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />

              <Textarea
                label="Биография"
                placeholder="Краткая биография..."
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Фото</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  label="URL фотографии"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/youth')}
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
