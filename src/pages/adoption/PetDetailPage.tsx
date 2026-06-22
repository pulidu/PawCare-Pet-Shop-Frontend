import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  PawPrint,
  Syringe,
  Heart,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ErrorState from '@/components/layout/ErrorState';
import { cn, getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import type { IPet } from '@/types';

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false);
  const [adopting, setAdopting] = useState(false);

  const { data: pet, isLoading, isError, refetch } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const res = await api.get(`/pets/${id}`);
      return (res.data?.data || res.data) as IPet;
    },
    enabled: !!id,
  });

  const handleAdopt = async () => {
    if (!id) return;
    setAdopting(true);
    try {
      await api.post(`/pets/${id}/adopt`);
      toast.success(`${pet?.name} has been adopted!`);
      setAdoptDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to adopt pet');
    } finally {
      setAdopting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="container px-4 py-8">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const images =
    pet.images?.length > 0 ? pet.images : ['/placeholder.svg'];
  const isAvailable = pet.status === 'available';

  const statusColor = {
    available: 'bg-green-500',
    adopted: 'bg-muted-foreground',
    pending: 'bg-amber-500',
  }[pet.status];

  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
      >
        <Link to="/adoption" className="hover:text-foreground transition-colors">
          Adoption
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <span className="text-foreground truncate">{pet.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
            <img
              src={getImageUrl(images[selectedImage])}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                    i === selectedImage
                      ? 'border-primary'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${pet.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pet Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{pet.name}</h1>
              <Badge className={cn('capitalize', statusColor)}>
                {pet.status}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{pet.breed}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <PawPrint className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Species</p>
              <p className="font-medium capitalize">{pet.species}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <Heart className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{pet.gender}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="font-medium">
                {pet.age} {pet.age === 1 ? 'year' : 'years'}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <PawPrint className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-medium">{pet.weight} kg</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <Syringe className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Vaccination</p>
              <p className="font-medium">
                {pet.vaccinationStatus ? 'Vaccinated' : 'Not vaccinated'}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <AlertCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Health</p>
              <p className="font-medium truncate" title={pet.healthCondition}>
                {pet.healthCondition || 'Good'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About {pet.name}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {pet.description}
            </p>
          </div>

          <Separator />

          {/* Action */}
          {pet.status === 'adopted' ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">{pet.name} has been adopted!</p>
                <p className="text-sm text-green-600">This pet has found their forever home.</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <Dialog open={adoptDialogOpen} onOpenChange={setAdoptDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={!isAvailable}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {isAvailable ? 'Adopt Me' : 'Already Adopted'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Adopt {pet.name}?</DialogTitle>
                  <DialogDescription>
                    You are about to adopt {pet.name}. This action will add {pet.name} to your pets.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setAdoptDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={adopting}
                    onClick={handleAdopt}
                  >
                    {adopting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
                    Confirm Adoption
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/auth/login">
                <Heart className="h-5 w-5 mr-2" />
                Login to Adopt
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
