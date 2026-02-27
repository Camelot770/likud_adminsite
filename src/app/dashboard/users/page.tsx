'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getUsers, exportUsersCSV } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, Download, Filter } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  source: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page,
        limit: 20,
        search: search || undefined,
        city: cityFilter || undefined,
      });
      const payload = response.data as any;
      setUsers(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, cityFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportUsersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка экспорта:', err);
    } finally {
      setExporting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Активен</Badge>;
      case 'inactive':
        return <Badge variant="default">Неактивен</Badge>;
      case 'blocked':
        return <Badge variant="danger">Заблокирован</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const sourceName = (source: string) => {
    const map: Record<string, string> = {
      telegram: 'Telegram',
      website: 'Сайт',
      referral: 'Реферал',
      event: 'Мероприятие',
      manual: 'Вручную',
    };
    return map[source] || source;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-500 mt-1">Управление базой пользователей</p>
        </div>
        <Button onClick={handleExport} loading={exporting} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Экспорт CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени, email, телефону..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Фильтр по городу"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>
          <Button type="submit" variant="primary">
            Найти
          </Button>
        </form>
      </Card>

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
                  <TableHead>Имя</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Теги</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    hoverable
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="info">
                            {tag}
                          </Badge>
                        ))}
                        {user.tags.length > 3 && (
                          <Badge variant="default">+{user.tags.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sourceName(user.source)}</TableCell>
                    <TableCell>{statusBadge(user.status)}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={6}>
                      Пользователи не найдены
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
