'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getPolls, deletePoll, closePoll } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Lock, BarChart3 } from 'lucide-react';

interface PollRow {
  id: string;
  question: string;
  options: Array<{ text: string; votes: number }>;
  totalVotes: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<PollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPolls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPolls({ page, limit: 20 });
      const payload = response.data as any;
      setPolls(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки опросов:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить этот опрос?')) return;
    try {
      await deletePoll(id);
      loadPolls();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleClose = async (id: string) => {
    if (!window.confirm('Закрыть этот опрос? Пользователи больше не смогут голосовать.')) return;
    try {
      await closePoll(id);
      loadPolls();
    } catch (err) {
      console.error('Ошибка закрытия:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Опросы</h1>
          <p className="text-gray-500 mt-1">Управление голосованиями и опросами</p>
        </div>
        <Link href="/dashboard/polls/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новый опрос
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
                  <TableHead>Вопрос</TableHead>
                  <TableHead>Варианты</TableHead>
                  <TableHead>Голосов</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {polls.map((poll) => (
                  <TableRow key={poll.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900 max-w-xs truncate">{poll.question}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {poll.options.slice(0, 3).map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div
                              className="h-1.5 bg-accent rounded-full"
                              style={{
                                width: `${poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 60 : 0}px`,
                                minWidth: '4px',
                              }}
                            />
                            <span className="text-gray-600 truncate max-w-[120px]">{opt.text}</span>
                            <span className="text-gray-400">({opt.votes})</span>
                          </div>
                        ))}
                        {poll.options.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{poll.options.length - 3} ещё
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">{poll.totalVotes}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {poll.status === 'active' ? (
                        <Badge variant="success">Активен</Badge>
                      ) : (
                        <Badge variant="default">Закрыт</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(poll.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {poll.status === 'active' && (
                          <button
                            onClick={() => handleClose(poll.id)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Закрыть опрос"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(poll.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {polls.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={6}>
                      Опросы не найдены
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
