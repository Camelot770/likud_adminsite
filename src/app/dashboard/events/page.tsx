'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getEvents, deleteEvent } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Plus, Edit, Trash2, MapPin, Users, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventRow {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  status: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEvents({ page, limit: 20 });
      const payload = response.data as any;
      setEvents(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки мероприятий:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить это мероприятие?')) return;
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <Badge variant="info">Предстоящее</Badge>;
      case 'ongoing': return <Badge variant="success">Идёт сейчас</Badge>;
      case 'completed': return <Badge variant="default">Завершено</Badge>;
      case 'cancelled': return <Badge variant="danger">Отменено</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мероприятия</h1>
          <p className="text-gray-500 mt-1">Управление мероприятиями и встречами</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новое мероприятие
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
                  <TableHead>Дата</TableHead>
                  <TableHead>Место</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{event.title}</p>
                    </TableCell>
                    <TableCell>{formatDateTime(event.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {event.attendees}/{event.maxAttendees}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(event.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/events/${event.id}`)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Подробнее"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={6}>
                      Мероприятия не найдены
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
