import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Loader2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { formatDate, cn, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IAdoptionRequest } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AdoptionRequests() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adoption-requests'],
    queryFn: async () => {
      const res = await api.get('/adoptions');
      return (res.data?.items || res.data || []) as IAdoptionRequest[];
    },
  });

  const requests = Array.isArray(data) ? data : [];

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getPetName = (req: IAdoptionRequest): string => {
    if (typeof req.pet === 'object' && req.pet) return req.pet.name;
    return 'Pet';
  };

  const getPetBreed = (req: IAdoptionRequest): string => {
    if (typeof req.pet === 'object' && req.pet) return req.pet.breed;
    return '';
  };

  const getPetId = (req: IAdoptionRequest): string => {
    if (typeof req.pet === 'object' && req.pet) return req.pet._id;
    return req.pet as string;
  };

  const getPetImage = (req: IAdoptionRequest): string | undefined => {
    if (typeof req.pet === 'object' && req.pet) return req.pet.images?.[0];
    return undefined;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Adoption Requests</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your adoption applications.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No adoption requests"
          description="You haven't applied to adopt any pets yet."
          action={{
            label: 'Browse Pets',
            onClick: () => (window.location.href = '/adoption'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpand(req._id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {getPetImage(req) ? (
                        <img
                          src={getImageUrl(getPetImage(req))}
                          alt={getPetName(req)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                          <HeartHandshake className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        <Link
                          to={`/adoption/${getPetId(req)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary transition-colors"
                        >
                          {getPetName(req)}
                        </Link>
                      </h3>
                      {getPetBreed(req) && (
                        <p className="text-sm text-muted-foreground">{getPetBreed(req)}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted {formatDate(req.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('capitalize shrink-0', statusConfig[req.status]?.className)}
                    >
                      {statusConfig[req.status]?.label || req.status}
                    </Badge>
                    <div className="shrink-0">
                      {expandedId === req._id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === req._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t mt-4 pt-4 space-y-3 text-sm">
                          <div>
                            <h4 className="font-semibold mb-1">Why do you want to adopt?</h4>
                            <p className="text-muted-foreground">{req.reason}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Pet Experience</h4>
                            <p className="text-muted-foreground">{req.experience}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Living Situation</h4>
                            <p className="text-muted-foreground">{req.livingSituation}</p>
                          </div>
                          {req.hasOtherPets && req.otherPetsDetail && (
                            <div>
                              <h4 className="font-semibold mb-1">Other Pets</h4>
                              <p className="text-muted-foreground">{req.otherPetsDetail}</p>
                            </div>
                          )}
                          {req.reviewNotes && (
                            <div className="rounded-lg bg-muted p-3">
                              <h4 className="font-semibold mb-1">Staff Notes</h4>
                              <p className="text-muted-foreground">{req.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
