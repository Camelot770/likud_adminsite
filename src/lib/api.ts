import { getToken, setToken, getRefreshToken, setRefreshToken, removeToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://likud-rus-camelot770.amvera.io/api/v1';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  noAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/admin/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, noAuth = false } = options;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!noAuth) {
    const token = getToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !noAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      reqHeaders['Authorization'] = `Bearer ${getToken()}`;
      res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Сессия истекла');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Ошибка сервера' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ==================== Auth ====================

export async function adminLogin(email: string, password: string) {
  return request<{ token: string; refreshToken: string; admin: { id: string; email: string; name: string; role: string } }>(
    '/admin/auth/login',
    { method: 'POST', body: { email, password }, noAuth: true }
  );
}

export async function adminLogout() {
  return request('/admin/auth/logout', { method: 'POST' });
}

// ==================== Dashboard ====================

export async function getDashboardStats() {
  return request<{
    totalUsers: number;
    newUsersThisWeek: number;
    eventsThisMonth: number;
    activePolls: number;
    userGrowth: Array<{ date: string; count: number }>;
    recentUsers: Array<{ id: string; name: string; city: string; createdAt: string }>;
    upcomingEvent: { id: string; title: string; date: string; location: string; attendees: number } | null;
    lastBroadcast: { id: string; title: string; sentAt: string; delivered: number; opened: number } | null;
  }>('/admin/dashboard');
}

// ==================== Users ====================

export async function getUsers(params?: { page?: number; limit?: number; search?: string; city?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.city) query.set('city', params.city);
  if (params?.status) query.set('status', params.status);
  return request<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    tags: string[];
    source: string;
    status: string;
    createdAt: string;
  }>>(`/admin/users?${query.toString()}`);
}

export async function getUser(id: string) {
  return request<{
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    tags: string[];
    source: string;
    status: string;
    notes: string;
    createdAt: string;
    events: Array<{ id: string; title: string; date: string }>;
    pollVotes: Array<{ id: string; question: string; answer: string }>;
  }>(`/admin/users/${id}`);
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  return request(`/admin/users/${id}`, { method: 'PUT', body: data });
}

export async function deleteUser(id: string) {
  return request(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function exportUsersCSV() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Ошибка экспорта');
  return res.blob();
}

// ==================== News ====================

export async function getNewsList(params?: { page?: number; limit?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  return request<Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    status: string;
    publishedAt: string | null;
    createdAt: string;
  }>>(`/admin/news?${query.toString()}`);
}

export async function getNewsItem(id: string) {
  return request<{
    id: string;
    title: string;
    slug: string;
    category: string;
    body: string;
    excerpt: string;
    imageUrl: string;
    status: string;
    publishedAt: string | null;
    createdAt: string;
  }>(`/admin/news/${id}`);
}

export async function createNews(data: {
  title: string;
  slug: string;
  category: string;
  body: string;
  excerpt: string;
  imageUrl?: string;
  status: string;
}) {
  return request('/admin/news', { method: 'POST', body: data });
}

export async function updateNews(id: string, data: Record<string, unknown>) {
  return request(`/admin/news/${id}`, { method: 'PUT', body: data });
}

export async function deleteNews(id: string) {
  return request(`/admin/news/${id}`, { method: 'DELETE' });
}

export async function publishNews(id: string) {
  return request(`/admin/news/${id}/publish`, { method: 'POST' });
}

// ==================== Events ====================

export async function getEvents(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return request<Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    attendees: number;
    maxAttendees: number;
    status: string;
  }>>(`/admin/events?${query.toString()}`);
}

export async function getEvent(id: string) {
  return request<{
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
  }>(`/admin/events/${id}`);
}

export async function createEvent(data: {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  imageUrl?: string;
  maxAttendees?: number;
}) {
  return request('/admin/events', { method: 'POST', body: data });
}

export async function updateEvent(id: string, data: Record<string, unknown>) {
  return request(`/admin/events/${id}`, { method: 'PUT', body: data });
}

export async function deleteEvent(id: string) {
  return request(`/admin/events/${id}`, { method: 'DELETE' });
}

// ==================== Polls ====================

export async function getPolls(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return request<Array<{
    id: string;
    question: string;
    options: Array<{ text: string; votes: number }>;
    totalVotes: number;
    status: string;
    createdAt: string;
    expiresAt: string | null;
  }>>(`/admin/polls?${query.toString()}`);
}

export async function getPoll(id: string) {
  return request<{
    id: string;
    question: string;
    options: Array<{ text: string; votes: number }>;
    totalVotes: number;
    status: string;
    createdAt: string;
    expiresAt: string | null;
  }>(`/admin/polls/${id}`);
}

export async function createPoll(data: {
  question: string;
  options: string[];
  expiresAt?: string;
}) {
  return request('/admin/polls', { method: 'POST', body: data });
}

export async function updatePoll(id: string, data: Record<string, unknown>) {
  return request(`/admin/polls/${id}`, { method: 'PUT', body: data });
}

export async function deletePoll(id: string) {
  return request(`/admin/polls/${id}`, { method: 'DELETE' });
}

export async function closePoll(id: string) {
  return request(`/admin/polls/${id}/close`, { method: 'POST' });
}

// ==================== Broadcasts ====================

export async function getBroadcasts(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return request<Array<{
    id: string;
    title: string;
    channel: string;
    segment: string;
    status: string;
    sentAt: string | null;
    delivered: number;
    opened: number;
    createdAt: string;
  }>>(`/admin/broadcasts?${query.toString()}`);
}

export async function getBroadcast(id: string) {
  return request<{
    id: string;
    title: string;
    body: string;
    channel: string;
    segment: string;
    status: string;
    sentAt: string | null;
    delivered: number;
    opened: number;
  }>(`/admin/broadcasts/${id}`);
}

export async function createBroadcast(data: {
  title: string;
  body: string;
  channel: string;
  segment: string;
}) {
  return request('/admin/broadcasts', { method: 'POST', body: data });
}

export async function sendBroadcast(id: string) {
  return request(`/admin/broadcasts/${id}/send`, { method: 'POST' });
}

export async function deleteBroadcast(id: string) {
  return request(`/admin/broadcasts/${id}`, { method: 'DELETE' });
}

// ==================== Feedback ====================

export async function getFeedback(params?: { page?: number; limit?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  return request<Array<{
    id: string;
    userName: string;
    userEmail: string;
    subject: string;
    message: string;
    status: string;
    reply: string | null;
    createdAt: string;
  }>>(`/admin/feedback?${query.toString()}`);
}

export async function replyToFeedback(id: string, reply: string) {
  return request(`/admin/feedback/${id}/reply`, { method: 'POST', body: { reply } });
}

export async function updateFeedbackStatus(id: string, status: string) {
  return request(`/admin/feedback/${id}`, { method: 'PUT', body: { status } });
}

// ==================== Analytics ====================

export async function getAnalytics(params?: { period?: string }) {
  const query = new URLSearchParams();
  if (params?.period) query.set('period', params.period);
  return request<{
    userGrowth: Array<{ date: string; count: number }>;
    geography: Array<{ city: string; count: number }>;
    engagement: Array<{ metric: string; value: number }>;
    topEvents: Array<{ title: string; attendees: number }>;
    channelStats: Array<{ channel: string; subscribers: number; active: number }>;
  }>(`/admin/analytics?${query.toString()}`);
}

// ==================== Settings ====================

export async function getAdmins() {
  return request<Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
  }>>('/admin/settings/admins');
}

export async function createAdmin(data: { email: string; name: string; password: string; role: string }) {
  return request('/admin/settings/admins', { method: 'POST', body: data });
}

export async function updateAdmin(id: string, data: Record<string, unknown>) {
  return request(`/admin/settings/admins/${id}`, { method: 'PUT', body: data });
}

export async function deactivateAdmin(id: string) {
  return request(`/admin/settings/admins/${id}/deactivate`, { method: 'POST' });
}

export async function activateAdmin(id: string) {
  return request(`/admin/settings/admins/${id}/activate`, { method: 'POST' });
}

// ==================== Youth ====================

export async function getYouthPrograms(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return request<any>(`/admin/youth/programs?${query.toString()}`);
}

export async function createYouthProgram(data: { title: string; description: string; image_url?: string; age_range?: string; schedule?: string; city?: string; contact_info?: string; sort_order?: number }) {
  return request('/admin/youth/programs', { method: 'POST', body: data });
}

export async function updateYouthProgram(id: string, data: Record<string, unknown>) {
  return request(`/admin/youth/programs/${id}`, { method: 'PUT', body: data });
}

export async function deleteYouthProgram(id: string) {
  return request(`/admin/youth/programs/${id}`, { method: 'DELETE' });
}

export async function getYouthLeaders() {
  return request<any>('/admin/youth/leaders');
}

export async function createYouthLeader(data: { name: string; position: string; photo_url?: string; bio?: string; sort_order?: number }) {
  return request('/admin/youth/leaders', { method: 'POST', body: data });
}

export async function updateYouthLeader(id: string, data: Record<string, unknown>) {
  return request(`/admin/youth/leaders/${id}`, { method: 'PUT', body: data });
}

export async function deleteYouthLeader(id: string) {
  return request(`/admin/youth/leaders/${id}`, { method: 'DELETE' });
}
