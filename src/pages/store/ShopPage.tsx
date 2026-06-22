import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Grid3X3,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/layout/EmptyState';
import ErrorState from '@/components/layout/ErrorState';
import { formatPrice, getImageUrl, cn } from '@/lib/utils';
import api from '@/services/api';
import type { IProduct, ICategory, PaginatedResponse } from '@/types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name' },
];

const ratings = [4, 3, 2, 1];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';
  const minRating = searchParams.get('rating') || '';

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (updates.page === undefined && !updates.hasOwnProperty('page')) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { isActive: true } });
      return (res.data?.data || []) as ICategory[];
    },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', page, search, sort, category, minPrice, maxPrice, brand, minRating],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (brand) params.brand = brand;
      if (minRating) params.rating = minRating;
      const res = await api.get('/products', { params });
      return { items: res.data.data, pagination: res.data.pagination } as PaginatedResponse<IProduct>;
    },
  });

  const products = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, pages: 0 };
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || minPrice || maxPrice || brand || minRating;

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post('/cart', { product: productId, quantity: 1 });
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-muted-foreground">
          {pagination.total > 0
            ? `Showing ${products.length} of ${pagination.total} products`
            : 'Browse our collection'}
        </p>
      </motion.div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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
        <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden sm:flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
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

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            'w-64 shrink-0 space-y-6',
            mobileFiltersOpen
              ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto'
              : 'hidden lg:block'
          )}
        >
          {mobileFiltersOpen && (
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Category */}
          <div>
            <h3 className="font-semibold mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={category === cat._id}
                    onCheckedChange={(checked) =>
                      updateParams({
                        category: checked ? cat._id : '',
                        page: '1',
                      })
                    }
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) =>
                  updateParams({ minPrice: e.target.value, page: '1' })
                }
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) =>
                  updateParams({ maxPrice: e.target.value, page: '1' })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <h3 className="font-semibold mb-3">Minimum Rating</h3>
            <div className="space-y-2">
              {ratings.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={minRating === String(r)}
                    onCheckedChange={(checked) =>
                      updateParams({
                        rating: checked ? String(r) : '',
                        page: '1',
                      })
                    }
                  />
                  <span className="flex items-center gap-1">
                    {Array.from({ length: r }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    {r > 1 && (
                      <span className="text-muted-foreground text-xs">& up</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                clearFilters();
                setMobileFiltersOpen(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </aside>

        {/* Mobile backdrop */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div
              className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className={cn(viewMode === 'grid' ? 'p-4' : 'p-4 flex gap-4')}>
                    {viewMode === 'grid' ? (
                      <>
                        <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </>
                    ) : (
                      <>
                        <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description={
                hasFilters
                  ? 'Try adjusting your filters'
                  : 'No products are available yet'
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
                <div
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: (i % 12) * 0.03 }}
                    >
                      <Card
                        className={cn(
                          'group overflow-hidden hover:shadow-lg transition-all duration-300 h-full',
                          viewMode === 'list' && 'flex'
                        )}
                      >
                        <Link
                          to={`/shop/${product._id}`}
                          className={cn(
                            'block',
                            viewMode === 'list' && 'flex gap-4 w-full'
                          )}
                        >
                          <div
                            className={cn(
                              'overflow-hidden bg-muted relative',
                              viewMode === 'grid'
                                ? 'aspect-square'
                                : 'w-48 h-48 shrink-0'
                            )}
                          >
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.discountPrice && (
                              <Badge className="absolute top-2 left-2 bg-destructive">
                                -
                                {Math.round(
                                  (1 - product.discountPrice / product.price) *
                                    100
                                )}
                                %
                              </Badge>
                            )}
                          </div>
                          <div
                            className={cn(
                              'flex flex-col',
                              viewMode === 'grid' ? 'p-4' : 'p-4 flex-1'
                            )}
                          >
                            <h3 className="font-semibold truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {product.brand}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    j < Math.round(product.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground/30'
                                  )}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({product.numReviews})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-auto pt-2">
                              <span className="font-bold text-lg">
                                {formatPrice(
                                  product.discountPrice || product.price
                                )}
                              </span>
                              {product.discountPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            {viewMode === 'list' && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </Link>
                        <div
                          className={cn(
                            viewMode === 'grid'
                              ? 'px-4 pb-4'
                              : 'p-4 flex items-center'
                          )}
                        >
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product._id);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </Card>
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
      </div>
    </div>
  );
}
