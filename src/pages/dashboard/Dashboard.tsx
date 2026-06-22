import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Calendar,
  HeartHandshake,
  Bell,
  Package,
  PawPrint,
  Stethoscope,
  Scissors,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ErrorState from '@/components/layout/ErrorState';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import type { IOrder, IAppointment, IAdoptionRequest, INotification } from '@/types';

const stagger = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      try {
        const res = await api.get('/orders', { params: { page: 1, limit: 5 } });
        return (res.data?.data || []) as IOrder[];
      } catch {
        return [];
      }
    },
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      try {
        const res = await api.get('/appointments');
        return (res.data?.items || res.data || []) as IAppointment[];
      } catch {
        return [];
      }
    },
  });

  const { data: adoptionData } = useQuery({
    queryKey: ['dashboard-adoptions'],
    queryFn: async () => {
      try {
        const res = await api.get('/adoptions');
        return (res.data?.items || res.data || []) as IAdoptionRequest[];
      } catch {
        return [];
      }
    },
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      try {
        const res = await api.get('/notifications');
        return (res.data?.items || res.data || []) as INotification[];
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const adoptions = Array.isArray(adoptionData) ? adoptionData : [];
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: Package,
      href: '/dashboard/orders',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Appointments',
      value: appointments.length,
      icon: Calendar,
      href: '/dashboard/appointments',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Adoption Requests',
      value: adoptions.length,
      icon: HeartHandshake,
      href: '/dashboard/adoption-requests',
      color: 'text-pink-600 bg-pink-100',
    },
    {
      title: 'Unread Notifications',
      value: notifications.filter((n: INotification) => !n.isRead).length,
      icon: Bell,
      href: '/dashboard/notifications',
      color: 'text-amber-600 bg-amber-100',
    },
  ];

  const quickActions = [
    { label: 'Shop Now', icon: ShoppingCart, href: '/shop', variant: 'default' as const },
    { label: 'Book Vet', icon: Stethoscope, href: '/veterinary', variant: 'outline' as const },
    { label: 'Book Grooming', icon: Scissors, href: '/grooming', variant: 'outline' as const },
    { label: 'Adopt a Pet', icon: PawPrint, href: '/adoption', variant: 'outline' as const },
  ];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your pet platform today.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-full', stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp}>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              onClick={() => navigate(action.href)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/orders" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No orders yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: IOrder) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('capitalize', statusBadge[order.status])}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/appointments" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No appointments scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt: IAppointment) => (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {typeof apt.doctor === 'object' && apt.doctor
                            ? apt.doctor.name
                            : 'Doctor'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(apt.date)} at {apt.timeSlot}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize shrink-0 ml-2',
                          apt.status === 'pending' &&
                            'bg-yellow-100 text-yellow-800 border-yellow-200',
                          apt.status === 'confirmed' &&
                            'bg-blue-100 text-blue-800 border-blue-200',
                          apt.status === 'completed' &&
                            'bg-green-100 text-green-800 border-green-200',
                          apt.status === 'cancelled' &&
                            'bg-red-100 text-red-800 border-red-200'
                        )}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
