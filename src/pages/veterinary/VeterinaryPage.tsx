import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Star,
  Calendar,
  Loader2,
  CheckCircle2,
  PawPrint,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { cn, getImageUrl, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import type { IDoctor, IPet } from '@/types';

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let h = startH;
  let m = startM;
  while (h < endH || (h === endH && m < endM)) {
    const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    slots.push(label);
    m += 30;
    if (m >= 60) {
      h += 1;
      m = 0;
    }
  }
  return slots;
}

const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export default function VeterinaryPage() {
  const { isAuthenticated } = useAuthStore();
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [selectedPet, setSelectedPet] = useState('');

  const { data: doctors, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return (res.data?.data || []) as IDoctor[];
    },
  });

  const doctorsList: IDoctor[] = Array.isArray(doctors) ? doctors : [];

  const { data: petsData, isLoading: petsLoading } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const res = await api.get('/pets/my');
      return (res.data?.data || []) as IPet[];
    },
    enabled: isAuthenticated && bookingDialogOpen,
  });

  const userPets: IPet[] = Array.isArray(petsData) ? petsData : [];

  const bookingMutation = useMutation({
    mutationFn: () =>
      api.post('/appointments', {
        doctor: selectedDoctor?._id,
        date,
        timeSlot,
        reason,
        pet: selectedPet || undefined,
      }),
    onSuccess: () => {
      toast.success('Appointment booked successfully');
      setBookingDialogOpen(false);
      setDate('');
      setTimeSlot('');
      setReason('');
      setSelectedPet('');
    },
    onError: () => toast.error('Failed to book appointment'),
  });

  const handleDoctorSelect = (doctor: IDoctor) => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      return;
    }
    setSelectedDoctor(doctor);
    setDate('');
    setTimeSlot('');
    setReason('');
    setSelectedPet('');
    setBookingDialogOpen(true);
  };

  const selectedDay = date ? dayNames[new Date(date).getDay()] : '';
  const availableSlotsForDay = selectedDoctor?.availableSlots?.find(
    (s) => s.day.toLowerCase() === selectedDay
  );
  const timeSlots = availableSlotsForDay
    ? generateTimeSlots(availableSlotsForDay.start, availableSlotsForDay.end)
    : [];

  const handleDateChange = (val: string) => {
    setDate(val);
    setTimeSlot('');
  };

  const handleSubmitBooking = () => {
    if (!date || !timeSlot || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }
    bookingMutation.mutate();
  };

  return (
    <div className="container px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border p-8 md:p-12 mb-8 overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Veterinary Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Expert veterinary care for your beloved pets. Our experienced
            doctors provide comprehensive health services with compassion and
            professionalism.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10">
          <Stethoscope className="h-64 w-64 text-blue-500" />
        </div>
      </motion.div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : doctorsList.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors available"
          description="We are currently onboarding our veterinary team. Please check back soon."
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsList.map((doctor, i) => (
              <motion.div
                key={doctor._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center h-full">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-4 ring-2 ring-primary/10">
                      <img
                        src={getImageUrl(doctor.profilePhoto)}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {doctor.qualification}
                    </p>
                    <Badge variant="secondary" className="mb-3">
                      {doctor.specialization}
                    </Badge>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {doctor.experience} yrs exp
                      </span>
                    </div>

                    <p className="text-lg font-bold text-primary mb-4">
                      {formatPrice(doctor.consultationFee)}
                    </p>

                    <div className="mt-auto w-full space-y-2">
                      {doctor.isAvailable && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit mx-auto mb-2"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Available
                        </Badge>
                      )}

                      <Dialog
                        open={bookingDialogOpen && selectedDoctor?._id === doctor._id}
                        onOpenChange={(open) => {
                          setBookingDialogOpen(open);
                          if (!open) setSelectedDoctor(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            disabled={!doctor.isAvailable}
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            {doctor.isAvailable
                              ? 'Book Appointment'
                              : 'Not Available'}
                          </Button>
                        </DialogTrigger>

                        {selectedDoctor?._id === doctor._id && (
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Book {doctor.name}
                              </DialogTitle>
                              <DialogDescription>
                                Choose a date and time for your consultation.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="pet">Select Pet</Label>
                                {petsLoading ? (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading your pets...
                                  </div>
                                ) : userPets.length === 0 ? (
                                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="font-medium">No pets registered</p>
                                      <p className="mt-1">
                                        Please add a pet in your{' '}
                                        <a
                                          href="/dashboard/pets"
                                          className="underline font-medium hover:text-amber-900"
                                        >
                                          dashboard
                                        </a>{' '}
                                        before booking.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <Select
                                    value={selectedPet}
                                    onValueChange={setSelectedPet}
                                  >
                                    <SelectTrigger id="pet">
                                      <SelectValue placeholder="Choose a pet (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {userPets.map((pet) => (
                                        <SelectItem key={pet._id} value={pet._id}>
                                          <span className="flex items-center gap-2">
                                            <PawPrint className="h-3.5 w-3.5 text-muted-foreground" />
                                            {pet.name} ({pet.species} - {pet.breed})
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="bookingDate">Date</Label>
                                <Input
                                  id="bookingDate"
                                  type="date"
                                  value={date}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleDateChange(e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Time Slot</Label>
                                {!date ? (
                                  <p className="text-sm text-muted-foreground">
                                    Select a date first
                                  </p>
                                ) : timeSlots.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No available slots for this day
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setTimeSlot(slot)}
                                        className={cn(
                                          'rounded-md border px-3 py-2 text-sm transition-all',
                                          timeSlot === slot
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input hover:border-primary/50'
                                        )}
                                      >
                                        {slot}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="reason">
                                  Reason for Visit <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Describe your pet's symptoms or reason for visit"
                                  rows={3}
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                />
                              </div>

                              <div className="rounded-lg bg-muted p-3 text-sm">
                                <p className="font-medium mb-1">
                                  Consultation Fee:{' '}
                                  {formatPrice(doctor.consultationFee)}
                                </p>
                                <p className="text-muted-foreground">
                                  Pay at the clinic
                                </p>
                              </div>

                              <Button
                                className="w-full"
                                disabled={bookingMutation.isPending}
                                onClick={handleSubmitBooking}
                              >
                                {bookingMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Calendar className="h-4 w-4 mr-2" />
                                )}
                                Confirm Booking
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
