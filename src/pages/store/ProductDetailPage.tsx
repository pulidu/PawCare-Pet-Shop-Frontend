import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorState from '@/components/layout/ErrorState';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import type { IProduct, IReview } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return (res.data?.product || res.data) as IProduct;
    },
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}/reviews`);
      return (res.data?.items || res.data?.reviews || res.data || []) as IReview[];
    },
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', id],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 4 } });
      return (res.data?.data || []) as IProduct[];
    },
    enabled: !!id,
  });

  const reviews: IReview[] = Array.isArray(reviewsData) ? reviewsData : [];
  const relatedProducts: IProduct[] = Array.isArray(relatedData)
    ? relatedData.filter((p) => p._id !== id)
    : [];

  const addToCartMutation = useMutation({
    mutationFn: () =>
      api.post('/cart', { product: id, quantity }),
    onSuccess: () => {
      toast.success('Added to cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => toast.error('Failed to add to cart'),
  });

  const submitReviewMutation = useMutation({
    mutationFn: () =>
      api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      }),
    onSuccess: () => {
      toast.success('Review submitted');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
    onError: () => toast.error('Failed to submit review'),
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container px-4 py-8">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ['/placeholder.svg'];
  const inStock = product.stock > 0;
  const avgRating = product.rating || 0;

  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
      >
        <Link to="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <span className="text-foreground truncate">{product.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-4">
            <img
              src={getImageUrl(images[selectedImage])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedImage
                      ? 'border-primary'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{product.brand}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive">
                  -
                  {Math.round(
                    (1 - product.discountPrice / product.price) * 100
                  )}
                  % OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                inStock ? 'bg-green-500' : 'bg-destructive'
              }`}
            />
            <span className={inStock ? 'text-green-600' : 'text-destructive'}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={!inStock}
              onClick={() => addToCartMutation.mutate()}
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>

            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'On orders over $50' },
              { icon: Shield, label: 'Secure Checkout', sub: 'SSL protected' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '30-day return' },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <f.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <Separator className="mb-8" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-8"
        >
          Customer Reviews
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage
                              src={
                                typeof review.user === 'object'
                                  ? getImageUrl(review.user?.avatar)
                                  : undefined
                              }
                            />
                            <AvatarFallback>
                              {typeof review.user === 'object'
                                ? review.user?.name?.charAt(0)
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {typeof review.user === 'object'
                                  ? review.user?.name
                                  : 'Anonymous'}
                              </p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: review.rating }).map(
                                  (_, j) => (
                                    <Star
                                      key={j}
                                      className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                            <p className="font-medium mt-1">{review.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Review Form */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReviewRating(r)}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              r <= reviewRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewTitle">Title</Label>
                    <input
                      id="reviewTitle"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Great product!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewComment">Comment</Label>
                    <Textarea
                      id="reviewComment"
                      rows={4}
                      placeholder="Share your experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    disabled={
                      submitReviewMutation.isPending ||
                      !reviewTitle ||
                      !reviewComment
                    }
                    onClick={() => submitReviewMutation.mutate()}
                  >
                    {submitReviewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <Separator className="mb-8" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8"
          >
            Related Products
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp, i) => (
              <motion.div
                key={rp._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/shop/${rp._id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-0">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={getImageUrl(rp.images?.[0])}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{rp.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">
                            {formatPrice(rp.discountPrice || rp.price)}
                          </span>
                          {rp.discountPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(rp.price)}
                            </span>
                          )}
                        </div>
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
  );
}
