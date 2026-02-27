'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getFeedback, replyToFeedback, updateFeedbackStatus } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';

interface FeedbackRow {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedItem, setSelectedItem] = useState<FeedbackRow | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFeedback({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      const payload = response.data as any;
      setFeedback(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки обращений:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleReply = async () => {
    if (!selectedItem || !replyText.trim()) return;
    setReplying(true);
    try {
      await replyToFeedback(selectedItem.id, replyText.trim());
      setSelectedItem(null);
      setReplyText('');
      loadFeedback();
    } catch (err) {
      console.error('Ошибка ответа:', err);
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateFeedbackStatus(id, status);
      loadFeedback();
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="info">Новое</Badge>;
      case 'in_progress': return <Badge variant="warning">В работе</Badge>;
      case 'resolved': return <Badge variant="success">Решено</Badge>;
      case 'closed': return <Badge variant="default">Закрыто</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const openReplyModal = (item: FeedbackRow) => {
    setSelectedItem(item);
    setReplyText(item.reply || '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Обращения</h1>
        <p className="text-gray-500 mt-1">Обратная связь от пользователей</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Все' },
          { value: 'new', label: 'Новые' },
          { value: 'in_progress', label: 'В работе' },
          { value: 'resolved', label: 'Решённые' },
          { value: 'closed', label: 'Закрытые' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === filter.value
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
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
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Тема</TableHead>
                  <TableHead>Сообщение</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{item.userName}</p>
                        <p className="text-xs text-gray-500">{item.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{item.subject}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">{item.message}</p>
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openReplyModal(item)}
                          className="p-1.5 text-accent hover:bg-accent-light rounded-lg"
                          title="Ответить"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        {item.status === 'new' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'in_progress')}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Взять в работу"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        {(item.status === 'new' || item.status === 'in_progress') && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'resolved')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Отметить решённым"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {feedback.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={6}>
                      Обращения не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Reply Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Ответ на обращение"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{selectedItem.userName}</span>
                <span className="text-xs text-gray-500">{formatDateTime(selectedItem.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{selectedItem.subject}</p>
              <p className="text-sm text-gray-700">{selectedItem.message}</p>
            </div>

            <Textarea
              label="Ваш ответ"
              placeholder="Введите ответ..."
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                Отмена
              </Button>
              <Button loading={replying} onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Отправить ответ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
