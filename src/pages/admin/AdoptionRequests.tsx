import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Heart,
  User,
  Home,
  FileText,
  PawPrint,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/layout/Loader';
import ErrorState from '@/components/layout/ErrorState';
import EmptyState from '@/components/layout/EmptyState';
import { formatDate } from '@/lib/utils';
import api from '@/services/api';
import type { IAdoptionRequest, PaginatedResponse } from '@/types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export default function AdminAdoptionRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<IAdoptionRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-adoption-requests', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/admin/adoptions', { params });
      return { items: res.data.data, pagination: res.data.pagination } as PaginatedResponse<IAdoptionRequest>;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reviewNotes: notes,
    }: {
      id: string;
      status: string;
      reviewNotes?: string;
    }) => {
      await api.put(`/admin/adoptions/${id}/status`, { status, reviewNotes: notes });
    },
    onSuccess: () => {
      toast.success('Adoption request updated');
      queryClient.invalidateQueries({ queryKey: ['admin-adoption-requests'] });
      setDetailOpen(false);
      setSelectedRequest(null);
    },
    onError: () => {
      toast.error('Failed to update adoption request');
    },
  });

  const viewDetails = (req: IAdoptionRequest) => {
    setSelectedRequest(req);
    setReviewNotes(req.reviewNotes || '');
    setDetailOpen(true);
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    reviewMutation.mutate({
      id: selectedRequest._id,
      status,
      reviewNotes,
    });
  };

  const requests = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  const getAdopterName = (req: IAdoptionRequest): string => {
    if (typeof req.user === 'object' && req.user) return req.user.name;
    return 'Unknown';
  };

  const getAdopterEmail = (req: IAdoptionRequest): string => {
    if (typeof req.user === 'object' && req.user) return req.user.email || '';
    return '';
  };

  const getPetName = (req: IAdoptionRequest): string => {
    if (typeof req.pet === 'object' && req.pet) return req.pet.name;
    return 'Unknown Pet';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Adoption Requests</h1>
        <p className="text-muted-foreground">Review and manage pet adoption applications</p>
      </motion.div>

      <div className="flex gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loader fullScreen={false} text="Loading adoption requests..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title={statusFilter ? 'No requests found' : 'No adoption requests yet'}
          description={
            statusFilter
              ? 'Try a different filter'
              : 'Adoption applications will appear here when submitted'
          }
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adopter</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getAdopterName(req)}</p>
                        <p className="text-xs text-muted-foreground">{getAdopterEmail(req)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>{getPetName(req)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusColors[req.status] || 'default'}
                        className="capitalize"
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => viewDetails(req)}>
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Adoption Request</DialogTitle>
            <DialogDescription>
              Review the applicant's details and approve or reject the request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Heart className="h-8 w-8 text-rose-500 shrink-0" />
                <div>
                  <p className="font-medium">{getPetName(selectedRequest)}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested by {getAdopterName(selectedRequest)}
                  </p>
                </div>
                <Badge
                  variant={statusColors[selectedRequest.status] || 'default'}
                  className="ml-auto capitalize"
                >
                  {selectedRequest.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" /> Reason for Adoption
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.reason}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" /> Pet Experience
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.experience}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4" /> Living Situation
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.livingSituation}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold">Has Other Pets</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.hasOtherPets
                      ? `Yes - ${selectedRequest.otherPetsDetail || ''}`
                      : 'No'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedRequest?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleReview('rejected')}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleReview('approved')}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
