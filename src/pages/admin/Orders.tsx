import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  MapPin,
  CreditCard,
  Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/layout/Loader';
import ErrorState from '@/components/layout/ErrorState';
import EmptyState from '@/components/layout/EmptyState';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/services/api';
import type { IOrder, PaginatedResponse } from '@/types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
};

const statusFlow = ['pending', 'processing', 'shipped', 'delivered'];

const nextStatus = (current: string): string | null => {
  const idx = statusFlow.indexOf(current);
  if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
  return null;
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', { params });
      return { items: res.data.data, pagination: res.data.pagination } as PaginatedResponse<IOrder>;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const orders = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loader fullScreen={false} text="Loading orders..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || statusFilter ? 'No orders found' : 'No orders yet'}
          description={
            search || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Customer orders will appear here'
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="font-medium">
                          {typeof order.user === 'object' ? order.user.name : 'Customer'}
                        </span>
                        {typeof order.user === 'object' && order.user && (
                          <span className="text-xs text-muted-foreground">
                            {order.user.email}
                          </span>
                        )}
                      </div>
                      <Badge variant={statusColors[order.status] || 'default'} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold">{formatPrice(order.total)}</span>
                        <span className="text-xs text-muted-foreground block sm:hidden">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatDate(order.createdAt)}
                      </span>
                      {expandedId === order._id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === order._id && (
                  <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Update Status:</span>
                      <Select
                        value={order.status}
                        onValueChange={(status) =>
                          statusMutation.mutate({ id: order._id, status })
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {nextStatus(order.status) && order.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            statusMutation.mutate({
                              id: order._id,
                              status: nextStatus(order.status)!,
                            })
                          }
                        >
                          Mark as {nextStatus(order.status)}
                        </Button>
                      )}
                      {statusMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4" /> Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <img
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-muted-foreground">
                                Qty: {item.quantity} x {formatPrice(item.price)}
                              </p>
                            </div>
                            <span className="font-medium">
                              {formatPrice(item.quantity * item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4" /> Shipping Address
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zip}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                          <CreditCard className="h-4 w-4" /> Payment
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <p>Method: {order.paymentMethod}</p>
                          <p>Status: {order.isPaid ? 'Paid' : 'Unpaid'}</p>
                          {order.paidAt && <p>Paid at: {formatDate(order.paidAt)}</p>}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                          <Receipt className="h-4 w-4" /> Price Breakdown
                        </h4>
                        <div className="text-sm space-y-0.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Shipping</span>
                            <span>{formatPrice(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Discount</span>
                              <span>-{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <Separator className="my-0.5" />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[36px]"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button
                variant="outline"
                size="icon"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
