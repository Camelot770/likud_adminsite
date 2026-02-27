'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getEvent, deleteEvent } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, Users, Trash2, Image } from 'lucide-react';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  address: string;
  imageUrl: string;
  maxAttendees: number;
  status: string;
  attendees: Array<{ id: string; name: string; email: string; registeredAt: string }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await getEvent(eventId);
      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить это мероприятие?')) return;
    try {
      await deleteEvent(eventId);
      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {statusBadge(event.status)}
          </div>
        </div>
        <Button variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardTitle>Описание</CardTitle>
          <p className="mt-3 text-gray-700 whitespace-pre-wrap">
            {event.description || 'Описание не указано'}
          </p>

          {event.imageUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}
        </Card>

        {/* Details Sidebar */}
        <Card>
          <CardTitle>Детали</CardTitle>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Начало</p>
                <p className="text-sm text-gray-600">{formatDateTime(event.date)}</p>
                {event.endDate && (
                  <>
                    <p className="text-sm font-medium mt-2">Окончание</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.endDate)}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{event.location}</p>
                {event.address && (
                  <p className="text-sm text-gray-600">{event.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Участники</p>
                <p className="text-sm text-gray-600">
                  {event.attendees.length}
                  {event.maxAttendees > 0 && ` из ${event.maxAttendees}`}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendees Table */}
      <Card padding={false}>
        <div className="p-6 pb-0">
          <CardTitle>
            Зарегистрированные участники ({event.attendees.length})
          </CardTitle>
        </div>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Дата регистрации</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.attendees.map((attendee) => (
                <TableRow
                  key={attendee.id}
                  hoverable
                  onClick={() => router.push(`/dashboard/users/${attendee.id}`)}
                >
                  <TableCell>
                    <span className="font-medium">{attendee.name}</span>
                  </TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{formatDate(attendee.registeredAt)}</TableCell>
                </TableRow>
              ))}
              {event.attendees.length === 0 && (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-400" colSpan={3}>
                    Пока нет зарегистрированных участников
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
