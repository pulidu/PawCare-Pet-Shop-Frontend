import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Bath,
  Sparkles,
  PawPrint,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import type { IGroomingBooking } from '@/types';

interface ServiceType {
  id: 'bathing' | 'hair-cutting' | 'nail-trimming' | 'full-grooming';
  name: string;
  price: number;
  description: string;
  icon: React.ElementType;
  duration: string;
}

const services: ServiceType[] = [
  {
    id: 'bathing',
    name: 'Bathing',
    price: 30,
    description:
      'A relaxing bath experience with premium pet-safe shampoos and conditioners. Includes towel drying and gentle brushing.',
    icon: Bath,
    duration: '30 min',
  },
  {
    id: 'hair-cutting',
    name: 'Hair Cutting',
    price: 45,
    description:
      'Professional haircut tailored to your pet\'s breed and your preferences. Includes styling and finishing touches.',
    icon: Scissors,
    duration: '45 min',
  },
  {
    id: 'nail-trimming',
    name: 'Nail Trimming',
    price: 20,
    description:
      'Careful nail trimming and filing to keep your pet\'s paws healthy and comfortable. Safe and stress-free.',
    icon: PawPrint,
    duration: '15 min',
  },
  {
    id: 'full-grooming',
    name: 'Full Grooming',
    price: 80,
    description:
      'The complete package: bath, haircut, nail trimming, ear cleaning, and de-shedding treatment. Everything your pet needs.',
    icon: Sparkles,
    duration: '90 min',
  },
];

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'other', label: 'Other' },
];

export default function GroomingPage() {
  const { isAuthenticated } = useAuthStore();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
  ];

  const bookingMutation = useMutation({
    mutationFn: () =>
      api.post('/grooming', {
        petName,
        petSpecies,
        petBreed,
        serviceType: selectedService?.id,
        date,
        timeSlot,
        notes,
      }),
    onSuccess: () => {
      toast.success('Grooming appointment booked successfully');
      setBookingDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to book grooming appointment'),
  });

  const resetForm = () => {
    setPetName('');
    setPetSpecies('');
    setPetBreed('');
    setDate('');
    setTimeSlot('');
    setNotes('');
  };

  const handleBookService = (service: ServiceType) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a grooming service');
      return;
    }
    setSelectedService(service);
    resetForm();
    setBookingDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!petName || !petSpecies || !date || !timeSlot) {
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
        className="relative rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border p-8 md:p-12 mb-8 overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pet Grooming
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Keep your pet looking and feeling their best with our professional
            grooming services. From baths to full styling, we've got them
            covered.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10">
          <Scissors className="h-64 w-64 text-purple-500" />
        </div>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-semibold">
                          {service.name}
                        </h3>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{service.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleBookService(service)}
                  >
                    Book {service.name}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onOpenChange={(open) => {
          setBookingDialogOpen(open);
          if (!open) setSelectedService(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Book {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Fill in your pet's details and preferred time.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-5 py-4">
              {/* Pet Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">
                    Pet Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="petName"
                    placeholder="Your pet's name"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petSpecies">
                    Species <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={petSpecies}
                    onValueChange={setPetSpecies}
                  >
                    <SelectTrigger id="petSpecies">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {speciesOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="petBreed">Breed</Label>
                <Input
                  id="petBreed"
                  placeholder="e.g. Golden Retriever"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger id="timeSlot">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or instructions"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Price Display */}
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{selectedService.name}</span>
                  <span className="font-semibold">
                    {formatPrice(selectedService.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Duration</span>
                  <span>{selectedService.duration}</span>
                </div>
                <div className="border-t mt-2 pt-2 flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(selectedService.price)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={bookingMutation.isPending}
                onClick={handleSubmit}
              >
                {bookingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirm Booking
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
