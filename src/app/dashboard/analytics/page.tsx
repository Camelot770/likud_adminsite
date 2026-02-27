'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { getAnalytics } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { formatDate } from '@/lib/utils';

interface AnalyticsData {
  userGrowth: Array<{ date: string; count: number }>;
  geography: Array<{ city: string; count: number }>;
  engagement: Array<{ metric: string; value: number }>;
  topEvents: Array<{ title: string; attendees: number }>;
  channelStats: Array<{ channel: string; subscribers: number; active: number }>;
}

const PIE_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#CA8A04', '#64748B', '#0891B2'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getAnalytics({ period });
      setData(response.data);
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Ошибка загрузки аналитики
      </div>
    );
  }

  const engagementLabels: Record<string, string> = {
    events_attended: 'Посещение мероприятий',
    polls_voted: 'Голоса в опросах',
    news_views: 'Просмотры новостей',
    feedback_sent: 'Обращения',
    broadcasts_opened: 'Открытие рассылок',
  };

  const channelLabels: Record<string, string> = {
    telegram: 'Telegram',
    email: 'Email',
    push: 'Push',
    website: 'Сайт',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-500 mt-1">Статистика платформы и вовлечённость</p>
        </div>
        <div className="w-40">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '7d', label: 'За 7 дней' },
              { value: '30d', label: 'За 30 дней' },
              { value: '90d', label: 'За 90 дней' },
              { value: '1y', label: 'За год' },
            ]}
          />
        </div>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardTitle>Рост пользователей</CardTitle>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()}.${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value: number) => [value, 'Пользователи']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geography Pie Chart */}
        <Card>
          <CardTitle>География пользователей</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.geography}
                  dataKey="count"
                  nameKey="city"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ city, percent }) => `${city} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {data.geography.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Пользователи']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Engagement Bars */}
        <Card>
          <CardTitle>Вовлечённость</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.engagement.map((e) => ({
                  ...e,
                  label: engagementLabels[e.metric] || e.metric,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  width={160}
                />
                <Tooltip formatter={(value: number) => [value, 'Значение']} />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events */}
        <Card>
          <CardTitle>Популярные мероприятия</CardTitle>
          <div className="mt-4 space-y-3">
            {data.topEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-6">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{
                        width: `${data.topEvents[0]?.attendees > 0 ? (event.attendees / data.topEvents[0].attendees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{event.attendees}</span>
              </div>
            ))}
            {data.topEvents.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет данных</p>
            )}
          </div>
        </Card>

        {/* Channel Stats */}
        <Card>
          <CardTitle>Каналы коммуникации</CardTitle>
          <div className="mt-4 space-y-4">
            {data.channelStats.map((channel, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {channelLabels[channel.channel] || channel.channel}
                  </span>
                  <span className="text-xs text-gray-500">
                    {channel.subscribers > 0
                      ? `${((channel.active / channel.subscribers) * 100).toFixed(0)}% активных`
                      : '0%'}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Подписчики: </span>
                    <span className="font-medium">{channel.subscribers.toLocaleString('ru-RU')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Активные: </span>
                    <span className="font-medium">{channel.active.toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.channelStats.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет данных</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
