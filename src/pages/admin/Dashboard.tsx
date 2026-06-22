import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Heart,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Scissors,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Loader from '@/components/layout/Loader';
import ErrorState from '@/components/layout/ErrorState';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/services/api';
import type { DashboardStats, IOrder } from '@/types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
};

const COLORS = ['#f59e0b', '#3b82f6', '#06b6d4', '#22c55e', '#ef4444'];

const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 5100 },
  { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 6300 },
  { month: 'Jul', revenue: 5500 },
  { month: 'Aug', revenue: 6700 },
  { month: 'Sep', revenue: 7200 },
  { month: 'Oct', revenue: 6100 },
  { month: 'Nov', revenue: 7800 },
  { month: 'Dec', revenue: 8900 },
];

const mockOrderStatus = [
  { name: 'Pending', value: 12 },
  { name: 'Processing', value: 18 },
  { name: 'Shipped', value: 8 },
  { name: 'Delivered', value: 45 },
  { name: 'Cancelled', value: 5 },
];

const quickLinks = [
  { to: '/admin/users', label: 'Users', icon: Users, color: 'text-blue-500' },
  { to: '/admin/products', label: 'Products', icon: Package, color: 'text-orange-500' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, color: 'text-purple-500' },
  { to: '/admin/categories', label: 'Categories', icon: TrendingUp, color: 'text-emerald-500' },
  { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope, color: 'text-pink-500' },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar, color: 'text-blue-500' },
  { to: '/admin/grooming', label: 'Grooming', icon: Scissors, color: 'text-amber-500' },
  { to: '/admin/boarding', label: 'Boarding', icon: Building2, color: 'text-cyan-500' },
  { to: '/admin/adoptions', label: 'Adoptions', icon: Heart, color: 'text-rose-500' },
];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data?.data as DashboardStats;
    },
    retry: 1,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-monthly-revenue'],
    queryFn: async () => {
      const res = await api.get('/admin/orders/stats/monthly');
      return (res.data?.items || res.data || []) as { month: string; revenue: number }[];
    },
    retry: 1,
  });

  const { data: orderStatusData, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-order-status'],
    queryFn: async () => {
      const res = await api.get('/admin/orders/stats/status');
      return (res.data?.items || res.data || []) as { name: string; value: number }[];
    },
    retry: 1,
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders', { params: { page: 1, limit: 5, sort: '-createdAt' } });
      return (res.data?.data || []) as IOrder[];
    },
    retry: 1,
  });

  const loading = statsLoading || revenueLoading || statusLoading || ordersLoading;
  const hasError = statsError && !stats;

  const safeStats: DashboardStats = {
    totalUsers: stats?.totalUsers ?? 0,
    totalOrders: stats?.totalOrders ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    totalProducts: stats?.totalProducts ?? 0,
    totalAppointments: stats?.totalAppointments ?? 0,
    totalAdoptionRequests: stats?.totalAdoptionRequests ?? 0,
  };

  const revenue =
    revenueData && revenueData.length > 0 ? revenueData : mockMonthlyRevenue;
  const statusDist =
    orderStatusData && orderStatusData.length > 0 ? orderStatusData : mockOrderStatus;
  const recentOrders = recentOrdersData || [];

  const gradientCards = [
    { gradient: 'from-blue-500 to-blue-600', icon: Users, label: 'Total Users', value: safeStats.totalUsers },
    { gradient: 'from-purple-500 to-purple-600', icon: ShoppingCart, label: 'Total Orders', value: safeStats.totalOrders },
    { gradient: 'from-emerald-500 to-emerald-600', icon: DollarSign, label: 'Total Revenue', value: formatPrice(safeStats.totalRevenue) },
    { gradient: 'from-orange-500 to-orange-600', icon: Package, label: 'Total Products', value: safeStats.totalProducts },
    { gradient: 'from-pink-500 to-pink-600', icon: Calendar, label: 'Appointments', value: safeStats.totalAppointments },
    { gradient: 'from-rose-500 to-rose-600', icon: Heart, label: 'Adoption Requests', value: safeStats.totalAdoptionRequests },
  ];

  if (loading && !stats && !recentOrders.length) {
    return <Loader text="Loading dashboard..." />;
  }

  if (hasError && !recentOrders.length) {
    return <ErrorState onRetry={refetchStats} />;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </motion.div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {gradientCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className={`bg-gradient-to-br ${card.gradient} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 opacity-80" />
                    </div>
                    <p className="mt-3 text-2xl font-bold">{card.value}</p>
                    <p className="text-xs opacity-80 mt-0.5">{card.label}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                    <ReTooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(v: number) => [formatPrice(v), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fill="url(#revenueGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusDist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusDist.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">#{order._id.slice(-8)}</TableCell>
                    <TableCell>
                      {typeof order.user === 'object' ? order.user.name : 'N/A'}
                    </TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className={`h-8 w-8 ${link.color}`} />
                    <span className="font-medium">{link.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
