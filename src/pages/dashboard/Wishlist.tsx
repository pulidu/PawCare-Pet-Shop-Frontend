import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Wishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-1">
          Items you&apos;ve saved for later.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
          <Heart className="h-10 w-10 text-pink-500" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Coming Soon</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          We&apos;re working on a wishlist feature that lets you save your favorite
          products, pets, and services. Stay tuned!
        </p>
        <Button onClick={() => (window.location.href = '/shop')}>
          Browse Products
        </Button>
      </div>
    </motion.div>
  );
}
