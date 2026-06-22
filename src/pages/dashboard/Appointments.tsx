import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  XCircle,
  Stethoscope,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { formatDate, cn, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IAppointment } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
};

const TAB_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Appointments() {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return (res.data?.data || []) as IAppointment[];
    },
  });

  const appointments = Array.isArray(data) ? data : [];

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((apt) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'cancelled') return apt.status === 'cancelled';
      if (activeTab === 'upcoming') {
        return (
          (apt.status === 'pending' || apt.status === 'confirmed') &&
          new Date(apt.date) >= new Date(now.setHours(0, 0, 0, 0))
        );
      }
      if (activeTab === 'past') {
        return (
          apt.status === 'completed' ||
          (new Date(apt.date) < new Date(now.setHours(0, 0, 0, 0)) &&
            apt.status !== 'cancelled')
        );
      }
      return true;
    });
  }, [appointments, activeTab]);

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/appointments/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled');
      setCancelId(null);
    },
    onError: () => {
      toast.error('Failed to cancel appointment');
    },
  });

  const getDoctorName = (apt: IAppointment): string => {
    if (typeof apt.doctor === 'object' && apt.doctor) return apt.doctor.name;
    return 'Doctor';
  };

  const getSpecialization = (apt: IAppointment): string => {
    if (typeof apt.doctor === 'object' && apt.doctor) return apt.doctor.specialization;
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage your veterinary appointments.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No appointments"
          description="Book a veterinary appointment to get started."
          action={{
            label: 'Book Appointment',
            onClick: () => (window.location.href = '/veterinary'),
          }}
        />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {TAB_FILTERS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No {activeTab !== 'all' ? activeTab : ''} appointments found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <motion.div
                  key={apt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{getDoctorName(apt)}</h3>
                            {getSpecialization(apt) && (
                              <p className="text-sm text-muted-foreground">{getSpecialization(apt)}</p>
                            )}
                            {apt.pet && typeof apt.pet === 'object' && (
                              <p className="text-sm mt-1">
                                <span className="text-muted-foreground">Pet: </span>
                                <span className="font-medium">{apt.pet.name}</span>
                                <span className="text-muted-foreground"> ({apt.pet.species} - {apt.pet.breed})</span>
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(apt.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {apt.timeSlot}
                            </span>
                          </div>
                          {apt.reason && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{apt.reason}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn('capitalize', statusConfig[apt.status]?.className)}
                          >
                            {statusConfig[apt.status]?.label || apt.status}
                          </Badge>

                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setCancelId(apt._id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Appointment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelId(null)}>
                  Keep Appointment
                </Button>
                <Button
                  variant="destructive"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelId && cancelMutation.mutate(cancelId)}
                >
                  {cancelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Yes, Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </motion.div>
  );
}
