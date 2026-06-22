import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  PawPrint,
  Loader2,
  Star,
  ArrowRight,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/layout/EmptyState';
import { formatPrice, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IProduct, IPet } from '@/types';

interface SearchResults {
  products: IProduct[];
  pets: IPet[];
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<SearchResults>({
    products: [],
    pets: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], pets: [] });
      setSearched(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const [productsRes, petsRes] = await Promise.all([
          api.get('/products', {
            params: { search: query.trim(), limit: 20 },
          }),
          api.get('/pets', {
            params: { search: query.trim(), limit: 20 },
          }),
        ]);

        setResults({
          products: productsRes.data?.data || [],
          pets: petsRes.data?.items || petsRes.data?.pets || [],
        });
      } catch {
        setResults({ products: [], pets: [] });
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {});
  };

  const totalResults = results.products.length + results.pets.length;

  return (
    <div className="container px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground mb-6">
          Find products, pets, and more
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What are you looking for?"
            className="pl-10 pr-10 h-12 text-lg"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setSearchParams({});
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>

        {/* Loading */}
        {loading && (
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && totalResults === 0 && (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`We couldn't find anything for "${query}". Try different keywords.`}
            action={{
              label: 'Browse Shop',
              onClick: () => (window.location.href = '/shop'),
            }}
          />
        )}

        {!loading && searched && totalResults > 0 && (
          <div className="space-y-10">
            {/* Summary */}
            <p className="text-sm text-muted-foreground">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for
              &ldquo;{query}&rdquo;
            </p>

            {/* Products */}
            {results.products.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Products ({results.products.length})
                  </h2>
                  <Link
                    to={`/shop?search=${encodeURIComponent(query)}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.products.slice(0, 6).map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link to={`/shop/${product._id}`}>
                        <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                          <CardContent className="p-0">
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={getImageUrl(product.images?.[0])}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-sm truncate">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <Star
                                    key={j}
                                    className={`h-3 w-3 ${
                                      j < Math.round(product.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="font-bold mt-1">
                                {formatPrice(
                                  product.discountPrice || product.price
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Pets */}
            {results.pets.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-green-500" />
                    Pets for Adoption ({results.pets.length})
                  </h2>
                  <Link
                    to={`/adoption?search=${encodeURIComponent(query)}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.pets.slice(0, 6).map((pet, i) => (
                    <motion.div
                      key={pet._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link to={`/adoption/${pet._id}`}>
                        <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                          <CardContent className="p-0">
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={getImageUrl(pet.images?.[0])}
                                alt={pet.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{pet.name}</h3>
                                <Badge
                                  variant={
                                    pet.status === 'available'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-[10px]"
                                >
                                  {pet.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {pet.breed} &middot; {pet.age}{' '}
                                {pet.age === 1 ? 'year' : 'years'} old
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Initial State */}
        {!searched && !loading && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Search for products, pets, and services
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
