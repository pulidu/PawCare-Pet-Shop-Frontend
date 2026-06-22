import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2,
  Home,
  Crown,
  Check,
  CalendarDays,
  Moon,
  Loader2,
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

interface RoomType {
  id: 'standard' | 'deluxe' | 'suite';
  name: string;
  pricePerNight: number;
  description: string;
  icon: React.ElementType;
  features: string[];
  amenities: string[];
  color: string;
}

const roomTypes: RoomType[] = [
  {
    id: 'standard',
    name: 'Standard',
    pricePerNight: 40,
    description:
      'Comfortable private kennel with full care essentials. Perfect for pets who love simplicity.',
    icon: Home,
    features: [
      'Private kennel',
      'Daily feeding',
      'Fresh water',
      'Morning walk',
    ],
    amenities: ['Bedding', 'Bowls', 'Heating'],
    color: 'from-blue-500/10 to-blue-500/5',
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    pricePerNight: 65,
    description:
      'Spacious suite with extra amenities and personalized attention for your pampered pet.',
    icon: Building2,
    features: [
      'Spacious suite',
      'Daily feeding (premium)',
      'Two walks daily',
      'Playtime sessions',
      'Treats included',
    ],
    amenities: ['Orthopedic bed', 'Raised bowls', 'TV/music', 'Webcam access'],
    color: 'from-purple-500/10 to-purple-500/5',
  },
  {
    id: 'suite',
    name: 'Suite',
    pricePerNight: 100,
    description:
      'The ultimate luxury experience. VIP treatment with round-the-clock care and premium amenities.',
    icon: Crown,
    features: [
      'Luxury suite',
      'Gourmet meals',
      'Unlimited walks',
      '1-on-1 playtime',
      'Grooming session',
      'Daily photo updates',
    ],
    amenities: [
      'Tempur-pedic bed',
      'CCTV monitoring',
      'A/C control',
      'Private courtyard',
      'Spa access',
    ],
    color: 'from-amber-500/10 to-amber-500/5',
  },
];

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
];

export default function BoardingPage() {
  const { isAuthenticated } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const selectedRoomType = roomTypes.find((r) => r.id === roomType);
  const totalPrice = nights * (selectedRoomType?.pricePerNight || 0);

  const bookingMutation = useMutation({
    mutationFn: () =>
      api.post('/boarding', {
        petName,
        petSpecies,
        petBreed,
        petAge: petAge ? parseInt(petAge, 10) : 0,
        checkIn,
        checkOut,
        roomType,
        specialInstructions,
      }),
    onSuccess: () => {
      toast.success('Boarding reservation submitted successfully');
      setBookingDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to submit boarding reservation'),
  });

  const resetForm = () => {
    setPetName('');
    setPetSpecies('');
    setPetBreed('');
    setPetAge('');
    setCheckIn('');
    setCheckOut('');
    setRoomType('');
    setSpecialInstructions('');
  };

  const handleBookRoom = (room: RoomType) => {
    if (!isAuthenticated) {
      toast.error('Please login to book boarding');
      return;
    }
    setSelectedRoom(room);
    setRoomType(room.id);
    resetForm();
    setBookingDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!petName || !petSpecies || !checkIn || !checkOut || !roomType) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (nights <= 0) {
      toast.error('Check-out must be after check-in');
      return;
    }
    bookingMutation.mutate();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="container px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border p-8 md:p-12 mb-8 overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pet Boarding & Hotel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A home away from home for your beloved pet. Comfortable
            accommodations, attentive care, and plenty of love while you're
            away.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10">
          <Moon className="h-64 w-64 text-emerald-500" />
        </div>
      </motion.div>

      {/* Room Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roomTypes.map((room, i) => {
          const Icon = room.icon;
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      'rounded-xl bg-gradient-to-br p-4 mb-4 text-center',
                      room.color
                    )}
                  >
                    <Icon className="h-10 w-10 mx-auto text-primary mb-2" />
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(room.pricePerNight)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /night
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {room.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Features
                    </p>
                    {room.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleBookRoom(room)}
                  >
                    Book {room.name}
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
          if (!open) setSelectedRoom(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Book {selectedRoom?.name} Room
            </DialogTitle>
            <DialogDescription>
              Reserve a comfortable stay for your pet.
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-5 py-4">
              {/* Pet Information */}
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
                  <Label htmlFor="petAge">Age</Label>
                  <Input
                    id="petAge"
                    type="number"
                    min="0"
                    placeholder="Years"
                    value={petAge}
                    onChange={(e) => setPetAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petSpecies">
                    Species <span className="text-destructive">*</span>
                  </Label>
                  <Select value={petSpecies} onValueChange={setPetSpecies}>
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
                <div className="space-y-2">
                  <Label htmlFor="petBreed">Breed</Label>
                  <Input
                    id="petBreed"
                    placeholder="e.g. Beagle"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">
                    Check-in <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">
                    Check-out <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <Label htmlFor="roomType">
                  Room Type <span className="text-destructive">*</span>
                </Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} - {formatPrice(r.pricePerNight)}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special needs, diet, medication, or instructions"
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Price Calculation */}
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Room Type</span>
                  <span className="font-medium">
                    {selectedRoomType?.name} {selectedRoomType && `(${formatPrice(selectedRoomType.pricePerNight)}/night)`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Duration</span>
                  <span className="font-medium">
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg text-primary">
                    {totalPrice > 0 ? formatPrice(totalPrice) : '---'}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={bookingMutation.isPending || nights <= 0}
                onClick={handleSubmit}
              >
                {bookingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CalendarDays className="h-4 w-4 mr-2" />
                )}
                Confirm Reservation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
