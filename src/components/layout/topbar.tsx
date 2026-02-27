'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { getAdminUser, logout } from '@/lib/auth';
import { adminLogout } from '@/lib/api';

export function Topbar() {
  const router = useRouter();
  const admin = getAdminUser();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // ignore errors on logout
    }
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="lg:hidden w-10" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium text-gray-900 text-sm">{admin?.name || 'Администратор'}</p>
              <p className="text-xs text-gray-500">{admin?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Выйти"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}
