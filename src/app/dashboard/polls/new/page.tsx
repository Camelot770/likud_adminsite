'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { createPoll } from '@/lib/api';
import { ArrowLeft, Save, Plus, X, GripVertical } from 'lucide-react';

export default function NewPollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledOptions = options.filter((o) => o.trim());
    if (!question.trim()) {
      setError('Введите вопрос');
      return;
    }
    if (filledOptions.length < 2) {
      setError('Добавьте минимум 2 варианта ответа');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createPoll({
        question: question.trim(),
        options: filledOptions,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      router.push('/dashboard/polls');
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
          onClick={() => router.push('/dashboard/polls')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новый опрос</h1>
          <p className="text-gray-500">Создание голосования</p>
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
              <Textarea
                label="Вопрос"
                placeholder="Введите вопрос для опроса..."
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Варианты ответов
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Вариант ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить вариант
                  </button>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Настройки</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  label="Срок действия (необязательно)"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  helpText="Оставьте пустым для бессрочного опроса"
                />
              </div>
            </Card>

            {/* Preview */}
            <Card>
              <CardTitle>Предпросмотр</CardTitle>
              <div className="mt-4 space-y-3">
                <p className="font-medium text-gray-900 text-sm">
                  {question || 'Вопрос опроса...'}
                </p>
                <div className="space-y-2">
                  {options.filter((o) => o.trim()).map((option, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/polls')}
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
