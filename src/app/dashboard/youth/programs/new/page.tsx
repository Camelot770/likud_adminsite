'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { createYouthProgram } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewYouthProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [schedule, setSchedule] = useState('');
  const [city, setCity] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Введите название программы');
      return;
    }
    if (!description.trim()) {
      setError('Введите описание программы');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createYouthProgram({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || undefined,
        age_range: ageRange.trim() || undefined,
        schedule: schedule.trim() || undefined,
        city: city.trim() || undefined,
        contact_info: contactInfo.trim() || undefined,
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
          <h1 className="text-2xl font-bold text-gray-900">Новая программа</h1>
          <p className="text-gray-500">Создание молодёжной программы</p>
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
                label="Название"
                placeholder="Введите название программы..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                label="Описание"
                placeholder="Введите описание программы..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <Input
                label="URL изображения"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Детали</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  label="Возрастной диапазон"
                  placeholder="например, 16-25"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                />

                <Input
                  label="Расписание"
                  placeholder="например, Пн-Пт 18:00"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />

                <Input
                  label="Город"
                  placeholder="например, Тель-Авив"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Input
                  label="Контактная информация"
                  placeholder="Телефон или email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
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
