'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, StatCard, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Users, UserPlus, Calendar, Vote, Send, ArrowRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalUsers: number;
  newUsersThisWeek: number;
  eventsThisMonth: number;
  activePolls: number;
  userGrowth: Array<{ date: string; count: number }>;
  recentUsers: Array<{ id: string; name: string; city: string; createdAt: string }>;
  upcomingEvent: { id: string; title: string; date: string; location: string; attendees: number } | null;
  lastBroadcast: { id: string; title: string; sentAt: string; delivered: number; opened: number } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getDashboardStats();
      const d = response.data as any;
      setData({
        totalUsers: d.totalUsers ?? d.total_users ?? 0,
        newUsersThisWeek: d.newUsersThisWeek ?? d.new_users_week ?? 0,
        eventsThisMonth: d.eventsThisMonth ?? d.events_this_month ?? 0,
        activePolls: d.activePolls ?? d.active_polls ?? 0,
        userGrowth: d.userGrowth ?? d.growth_data ?? [],
        recentUsers: d.recentUsers ?? d.recent_users ?? [],
        upcomingEvent: d.upcomingEvent ?? d.upcoming_event ?? null,
        lastBroadcast: d.lastBroadcast ?? d.last_broadcast ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-500 mt-1">Обзор платформы Ликуд на русском</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего пользователей"
          value={data.totalUsers.toLocaleString('ru-RU')}
          change="+12% за месяц"
          changeType="positive"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Новых за неделю"
          value={data.newUsersThisWeek}
          change="+5% к прошлой"
          changeType="positive"
          icon={<UserPlus className="h-6 w-6" />}
        />
        <StatCard
          title="Мероприятий в этом месяце"
          value={data.eventsThisMonth}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Активных опросов"
          value={data.activePolls}
          icon={<Vote className="h-6 w-6" />}
        />
      </div>

      {/* Growth Chart */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Последние пользователи</CardTitle>
            <Link
              href="/dashboard/users"
              className="text-sm text-accent hover:text-accent-hover flex items-center gap-1"
            >
              Все <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentUsers.map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/users/${user.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent-light rounded-full flex items-center justify-center">
                    <span className="text-accent font-medium text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.city}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
              </Link>
            ))}
            {data.recentUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет данных</p>
            )}
          </div>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Upcoming Event */}
          <Card>
            <CardTitle>Ближайшее мероприятие</CardTitle>
            {data.upcomingEvent ? (
              <Link
                href={`/dashboard/events/${data.upcomingEvent.id}`}
                className="block mt-3 space-y-2"
              >
                <p className="font-medium text-gray-900">{data.upcomingEvent.title}</p>
                <p className="text-sm text-gray-500">{formatDateTime(data.upcomingEvent.date)}</p>
                <p className="text-sm text-gray-500">{data.upcomingEvent.location}</p>
                <Badge variant="info">{data.upcomingEvent.attendees} участников</Badge>
              </Link>
            ) : (
              <p className="text-sm text-gray-400 mt-3">Нет предстоящих мероприятий</p>
            )}
          </Card>

          {/* Last Broadcast */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Send className="h-4 w-4 text-gray-400" />
              <CardTitle>Последняя рассылка</CardTitle>
            </div>
            {data.lastBroadcast ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{data.lastBroadcast.title}</p>
                <p className="text-sm text-gray-500">
                  Отправлено: {formatDateTime(data.lastBroadcast.sentAt)}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Доставлено:</span>{' '}
                    <span className="font-medium">{data.lastBroadcast.delivered}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Открыто:</span>{' '}
                    <span className="font-medium">{data.lastBroadcast.opened}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Нет рассылок</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
