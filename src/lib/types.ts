
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  source: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  body: string;
  excerpt: string;
  imageUrl: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  imageUrl?: string;
  maxAttendees?: number;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Poll {
  id: string;
  question: string;
  options: Array<{ text: string; votes: number }>;
  totalVotes: number;
  status: 'active' | 'closed';
  createdAt: string;
  expiresAt: string | null;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  channel: 'telegram' | 'email' | 'push' | 'all';
  segment: string;
  status: 'draft' | 'sent' | 'scheduled';
  sentAt: string | null;
  delivered: number;
  opened: number;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  reply: string | null;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'moderator';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersThisWeek: number;
  eventsThisMonth: number;
  activePolls: number;
  userGrowth: Array<{ date: string; count: number }>;
  recentUsers: Array<{ id: string; name: string; city: string; createdAt: string }>;
  upcomingEvent: { id: string; title: string; date: string; location: string; attendees: number } | null;
  lastBroadcast: { id: string; title: string; sentAt: string; delivered: number; opened: number } | null;
}
