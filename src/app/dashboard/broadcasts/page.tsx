'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getBroadcasts, deleteBroadcast, sendBroadcast } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Plus, Trash2, Send, Mail, MessageSquare } from 'lucide-react';

interface BroadcastRow {
  id: string;
  title: string;
  channel: string;
  segment: string;
  status: string;
  sentAt: string | null;
  delivered: number;
  opened: number;
  createdAt: string;
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBroadcasts({ page, limit: 20 });
      const payload = response.data as any;
      setBroadcasts(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки рассылок:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту рассылку?')) return;
    try {
      await deleteBroadcast(id);
      loadBroadcasts();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleSend = async (id: string) => {
    if (!window.confirm('Отправить эту рассылку? Это действие нельзя отменить.')) return;
    try {
      await sendBroadcast(id);
      loadBroadcasts();
    } catch (err) {
      console.error('Ошибка отправки:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge variant="success">Отправлено</Badge>;
      case 'draft': return <Badge variant="warning">Черновик</Badge>;
      case 'scheduled': return <Badge variant="info">Запланировано</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'telegram': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'email': return <Mail className="h-3.5 w-3.5" />;
      default: return <Send className="h-3.5 w-3.5" />;
    }
  };

  const channelName = (channel: string) => {
    const map: Record<string, string> = {
      telegram: 'Telegram',
      email: 'Email',
      push: 'Push',
      all: 'Все каналы',
    };
    return map[channel] || channel;
  };

  const segmentName = (segment: string) => {
    const map: Record<string, string> = {
      all: 'Все пользователи',
      active: 'Активные',
      new: 'Новые',
      inactive: 'Неактивные',
      tel_aviv: 'Тель-Авив',
      jerusalem: 'Иерусалим',
      haifa: 'Хайфа',
    };
    return map[segment] || segment;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Рассылки</h1>
          <p className="text-gray-500 mt-1">Управление уведомлениями и рассылками</p>
        </div>
        <Link href="/dashboard/broadcasts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новая рассылка
          </Button>
        </Link>
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Канал</TableHead>
                  <TableHead>Сегмент</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Доставлено</TableHead>
                  <TableHead>Открыто</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.sentAt && (
                          <p className="text-xs text-gray-500">{formatDateTime(item.sentAt)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {channelIcon(item.channel)}
                        {channelName(item.channel)}
                      </div>
                    </TableCell>
                    <TableCell>{segmentName(item.segment)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>{item.delivered > 0 ? item.delivered.toLocaleString('ru-RU') : '-'}</TableCell>
                    <TableCell>{item.opened > 0 ? item.opened.toLocaleString('ru-RU') : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === 'draft' && (
                          <button
                            onClick={() => handleSend(item.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Отправить"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {item.status !== 'sent' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {broadcasts.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={7}>
                      Рассылки не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
