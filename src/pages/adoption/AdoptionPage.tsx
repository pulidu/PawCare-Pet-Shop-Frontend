import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Heart,
  MapPin,
  Syringe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { cn, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IPet, PaginatedResponse } from '@/types';

const speciesOptions = [
  { value: '', label: 'All Species' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'bird', label: 'Birds' },
  { value: 'rabbit', label: 'Rabbits' },
];

const genderOptions = [
  { value: '', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ageOptions = [
  { value: '', label: 'Any Age' },
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-7', label: '3-7 years' },
  { value: '7+', label: '7+ years' },
];

const statusOptions = [
  { value: '', label: 'Any Status' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'adopted', label: 'Adopted' },
];

export default function AdoptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const species = searchParams.get('species') || '';
  const gender = searchParams.get('gender') || '';
  const age = searchParams.get('age') || '';
  const status = searchParams.get('status') || 'available';

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.hasOwnProperty('page')) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pets', page, search, species, gender, age, status],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (species) params.species = species;
      if (gender) params.gender = gender;
      if (age) params.age = age;
      if (status) params.status = status;
      const res = await api.get('/pets', { params });
      return res.data as { success: boolean; data: IPet[]; pagination: { page: number; limit: number; total: number; pages: number } };
    },
  });

  const pets = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, pages: 0 };
  const hasFilters = species || gender || age || status;

  const clearFilters = () => setSearchParams({});

  const speciesColors: Record<string, string> = {
    dog: 'bg-amber-100 text-amber-800 border-amber-200',
    cat: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    bird: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rabbit: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  return (
    <div className="container px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 md:p-12 mb-8 overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your New Best Friend
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Give a loving home to a pet in need. Browse our adorable companions
            waiting for their forever families.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10">
          <PawPrint className="h-64 w-64 text-primary" />
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pets by name, breed..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value, page: '1' })}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => updateParams({ search: '', page: '1' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          className="sm:hidden"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Bar */}
      <div
        className={cn(
          'flex flex-wrap gap-3 mb-8',
          mobileFiltersOpen ? 'flex-col' : 'hidden sm:flex'
        )}
      >
        <Select value={species} onValueChange={(v) => updateParams({ species: v })}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Species" />
          </SelectTrigger>
          <SelectContent>
            {speciesOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gender} onValueChange={(v) => updateParams({ gender: v })}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={age} onValueChange={(v) => updateParams({ age: v })}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Age" />
          </SelectTrigger>
          <SelectContent>
            {ageOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => updateParams({ status: v })}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile backdrop */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Pet Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          title="No pets found"
          description={
            hasFilters
              ? 'Try adjusting your filters to find more pets'
              : 'No pets are available for adoption yet'
          }
          action={
            hasFilters
              ? { label: 'Clear Filters', onClick: clearFilters }
              : undefined
          }
        />
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet, i) => (
                <motion.div
                  key={pet._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: (i % 12) * 0.03 }}
                >
                  <Link to={`/adoption/${pet._id}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                      <CardContent className="p-0">
                        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                          <img
                            src={getImageUrl(pet.images?.[0])}
                            alt={pet.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge
                            className={cn(
                              'absolute top-3 right-3 capitalize',
                              pet.status === 'available'
                                ? 'bg-green-500 hover:bg-green-600'
                                : pet.status === 'pending'
                                  ? 'bg-amber-500 hover:bg-amber-600'
                                  : 'bg-muted-foreground'
                            )}
                          >
                            {pet.status}
                          </Badge>
                          <div
                            className={cn(
                              'absolute top-3 left-3 border',
                              speciesColors[pet.species] || 'bg-gray-100'
                            )}
                          >
                            <Badge
                              variant="outline"
                              className={speciesColors[pet.species]}
                            >
                              {pet.species}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg truncate">
                              {pet.name}
                            </h3>
                            <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pet.breed}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 capitalize">
                              <PawPrint className="h-3.5 w-3.5" />
                              {pet.gender}
                            </span>
                            <span>{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {pet.weight} kg
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            {pet.vaccinationStatus ? (
                              <Badge
                                variant="secondary"
                                className="text-xs flex items-center gap-1"
                              >
                                <Syringe className="h-3 w-3" />
                                Vaccinated
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                Not vaccinated
                              </Badge>
                            )}
                            {pet.status === 'available' && (
                              <Badge
                                variant="default"
                                className="text-xs ml-auto cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/adoption/${pet._id}`;
                                }}
                              >
                                Adopt Me
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.pages ||
                    Math.abs(p - page) <= 2
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[36px]"
                      onClick={() => updateParams({ page: String(p) })}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button
                variant="outline"
                size="icon"
                disabled={page >= pagination.pages}
                onClick={() => updateParams({ page: String(page + 1) })}
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
