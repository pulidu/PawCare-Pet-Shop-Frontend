import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PawPrint, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { getImageUrl, cn } from '@/lib/utils';
import api from '@/services/api';
import type { IPet } from '@/types';

const speciesColors: Record<string, string> = {
  dog: 'bg-amber-100 text-amber-800 border-amber-200',
  cat: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  bird: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rabbit: 'bg-pink-100 text-pink-800 border-pink-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-500 hover:bg-green-600',
  adopted: 'bg-muted-foreground',
  pending: 'bg-amber-500 hover:bg-amber-600',
};

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  healthCondition: string;
  description: string;
  vaccinationStatus: boolean;
  images: string[];
}

const emptyForm: PetFormData = {
  name: '',
  species: '',
  breed: '',
  age: '',
  gender: '',
  weight: '',
  healthCondition: '',
  description: '',
  vaccinationStatus: false,
  images: [],
};

export default function Pets() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PetFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-pets'],
    queryFn: async () => {
      const res = await api.get('/pets/my');
      return (res.data?.data || []) as IPet[];
    },
  });

  const pets = Array.isArray(data) ? data : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        age: parseInt(form.age, 10),
        weight: parseFloat(form.weight),
        vaccinationStatus: form.vaccinationStatus,
        images: form.images.filter(Boolean),
      };
      await api.post('/pets', payload);
      toast.success('Pet added successfully');
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      setDialogOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error('Failed to add pet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Pets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your registered pets.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="aspect-[4/3] rounded-t-lg rounded-b-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No pets yet"
          description="Add your first pet to get started."
          action={{
            label: 'Add Pet',
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet, i) => (
            <motion.div
              key={pet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 12) * 0.03 }}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {pet.images?.[0] ? (
                      <img
                        src={getImageUrl(pet.images[0])}
                        alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <PawPrint className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge
                      className={cn(
                        'absolute top-3 right-3 capitalize',
                        statusColors[pet.status] || 'bg-muted-foreground'
                      )}
                    >
                      {pet.status}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg truncate">{pet.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn('capitalize text-xs', speciesColors[pet.species] || speciesColors.other)}
                      >
                        {pet.species}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="capitalize">{pet.gender}</span>
                      <span>{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
                      <span>{pet.weight} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a Pet</DialogTitle>
            <DialogDescription>
              Register your pet to manage appointments, grooming, and more.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Select
                  value={form.species}
                  onValueChange={(v) => setForm({ ...form, species: v })}
                >
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  step="1"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="healthCondition">Health Condition</Label>
                <Input
                  id="healthCondition"
                  value={form.healthCondition}
                  onChange={(e) => setForm({ ...form, healthCondition: e.target.value })}
                  placeholder="e.g. Healthy, Allergies, etc."
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 flex items-center gap-2">
                <Switch
                  id="vaccinationStatus"
                  checked={form.vaccinationStatus}
                  onCheckedChange={(v) => setForm({ ...form, vaccinationStatus: v })}
                />
                <Label htmlFor="vaccinationStatus">Vaccination up to date</Label>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="images">Image URLs (one per line)</Label>
                <Textarea
                  id="images"
                  value={form.images.join('\n')}
                  onChange={(e) =>
                    setForm({ ...form, images: e.target.value.split('\n').filter(Boolean) })
                  }
                  placeholder="https://example.com/pet.jpg"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Pet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
