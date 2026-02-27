'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getNewsList, deleteNews, publishNews } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Globe, Eye } from 'lucide-react';

interface NewsRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNewsList({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      const payload = response.data as any;
      setNewsList(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту новость?')) return;
    try {
      await deleteNews(id);
      loadNews();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishNews(id);
      loadNews();
    } catch (err) {
      console.error('Ошибка публикации:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="success">Опубликовано</Badge>;
      case 'draft': return <Badge variant="warning">Черновик</Badge>;
      case 'archived': return <Badge variant="default">Архив</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const categoryName = (cat: string) => {
    const map: Record<string, string> = {
      politics: 'Политика',
      community: 'Сообщество',
      culture: 'Культура',
      events: 'Мероприятия',
      opinion: 'Мнение',
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новости</h1>
          <p className="text-gray-500 mt-1">Управление новостными публикациями</p>
        </div>
        <Link href="/dashboard/news/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать новость
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'draft', 'published', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === status
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === '' ? 'Все' : status === 'draft' ? 'Черновики' : status === 'published' ? 'Опубликованные' : 'Архив'}
          </button>
        ))}
      </div>

      {/* Table */}
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
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">/{item.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{categoryName(item.category)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.publishedAt ? formatDate(item.publishedAt) : formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Опубликовать"
                          >
                            <Globe className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/news/${item.id}/edit`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {newsList.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={5}>
                      Новости не найдены
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
