'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui/table';
import { getYouthPrograms, deleteYouthProgram, getYouthLeaders, deleteYouthLeader } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

type Tab = 'programs' | 'leaders';

interface ProgramRow {
  id: string;
  title: string;
  city?: string;
  age_range?: string;
  schedule?: string;
  status?: string;
}

interface LeaderRow {
  id: string;
  name: string;
  position: string;
  status?: string;
}

export default function YouthPage() {
  const [tab, setTab] = useState<Tab>('programs');

  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programPage, setProgramPage] = useState(1);
  const [programTotalPages, setProgramTotalPages] = useState(1);

  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  const loadPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      const response = await getYouthPrograms({ page: programPage, limit: 20 });
      const payload = response.data as any;
      setPrograms(Array.isArray(payload) ? payload : payload?.items || []);
      const total = response.total || payload?.total || 0;
      const perPage = response.limit || payload?.limit || 20;
      if (total > 0) {
        setProgramTotalPages(Math.ceil(total / perPage));
      }
    } catch (err) {
      console.error('Ошибка загрузки программ:', err);
    } finally {
      setLoadingPrograms(false);
    }
  }, [programPage]);

  const loadLeaders = useCallback(async () => {
    setLoadingLeaders(true);
    try {
      const response = await getYouthLeaders();
      const payload = response.data as any;
      setLeaders(Array.isArray(payload) ? payload : payload || []);
    } catch (err) {
      console.error('Ошибка загрузки лидеров:', err);
    } finally {
      setLoadingLeaders(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    loadLeaders();
  }, [loadLeaders]);

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Удалить эту программу?')) return;
    try {
      await deleteYouthProgram(id);
      loadPrograms();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleDeleteLeader = async (id: string) => {
    if (!window.confirm('Удалить этого лидера?')) return;
    try {
      await deleteYouthLeader(id);
      loadLeaders();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Молодёжь</h1>
          <p className="text-gray-500 mt-1">Управление молодёжными программами и лидерами</p>
        </div>
        <div className="flex gap-2">
          {tab === 'programs' && (
            <Link href="/dashboard/youth/programs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Новая программа
              </Button>
            </Link>
          )}
          {tab === 'leaders' && (
            <Link href="/dashboard/youth/leaders/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Новый лидер
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('programs')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'programs'
              ? 'bg-accent text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Программы
        </button>
        <button
          onClick={() => setTab('leaders')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'leaders'
              ? 'bg-accent text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Лидеры
        </button>
      </div>

      {/* Programs Tab */}
      {tab === 'programs' && (
        <Card padding={false}>
          {loadingPrograms ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Город</TableHead>
                    <TableHead>Возраст</TableHead>
                    <TableHead>Расписание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{program.title}</p>
                      </TableCell>
                      <TableCell>{program.city || '—'}</TableCell>
                      <TableCell>{program.age_range || '—'}</TableCell>
                      <TableCell>{program.schedule || '—'}</TableCell>
                      <TableCell>
                        {program.status === 'active' ? (
                          <Badge variant="success">Активна</Badge>
                        ) : (
                          <Badge variant="default">{program.status || 'Черновик'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {programs.length === 0 && (
                    <TableRow>
                      <TableCell className="text-center py-8 text-gray-400" colSpan={6}>
                        Программы не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={programPage} totalPages={programTotalPages} onPageChange={setProgramPage} />
            </>
          )}
        </Card>
      )}

      {/* Leaders Tab */}
      {tab === 'leaders' && (
        <Card padding={false}>
          {loadingLeaders ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{leader.name}</p>
                    </TableCell>
                    <TableCell>{leader.position}</TableCell>
                    <TableCell>
                      {leader.status === 'active' ? (
                        <Badge variant="success">Активен</Badge>
                      ) : (
                        <Badge variant="default">{leader.status || 'Черновик'}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteLeader(leader.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {leaders.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-400" colSpan={4}>
                      Лидеры не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
