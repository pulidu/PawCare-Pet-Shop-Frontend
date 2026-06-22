import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  PawPrint,
  Stethoscope,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Star,
  Mail,
  ArrowRight,
  Shield,
  Heart,
  Award,
  Users,
  Check,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IProduct } from '@/types';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || count > 0) return;
    const duration = 2000;
    const steps = 30;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setCount(Math.min(Math.round((end * current) / steps), end));
      if (current >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, end, count]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold text-center mb-12"
    >
      {children}
    </motion.h2>
  );
}

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Pet Owner',
    quote:
      'PET has been a game-changer for my golden retriever. The products are top quality and the grooming service is fantastic!',
    avatar: 'SJ',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Cat Parent',
    quote:
      'I adopted my cat through PET and the process was smooth and caring. They truly love animals.',
    avatar: 'MC',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Dog Lover',
    quote:
      'The veterinary team at PET is incredible. They took such great care of my puppy during his checkup.',
    avatar: 'ER',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Pet Enthusiast',
    quote:
      'Boarding my pets at PET gives me peace of mind. The facilities are clean and the staff is wonderful.',
    avatar: 'DK',
    rating: 5,
  },
];

const faqs = [
  {
    q: 'What types of pets do you serve?',
    a: 'We serve dogs, cats, birds, rabbits, and other small pets. Our products and services are tailored to meet the needs of various pets.',
  },
  {
    q: 'How do I adopt a pet?',
    a: 'Browse our available pets on the Adoption page, submit an adoption request, and our team will review your application. We ensure every pet goes to a loving home.',
  },
  {
    q: 'Do I need an appointment for veterinary services?',
    a: 'Yes, we recommend booking an appointment online to ensure availability. Walk-ins are welcome but may have longer wait times.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy on most products. Items must be unused and in original packaging. Pet food and treats are non-returnable for safety reasons.',
  },
  {
    q: 'Do you offer pet grooming for all breeds?',
    a: 'Yes, our professional groomers are experienced with all breeds and sizes. We offer bathing, hair cutting, nail trimming, and full grooming packages.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [email, setEmail] = useState('');

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { featured: true, limit: 4 },
      });
      return res.data.data || [];
    },
  });

  const featuredProducts: IProduct[] = Array.isArray(featuredData)
    ? featuredData
    : [];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setEmail('');
    } catch {
      // silently fail
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Premium Pet Care Since 2020
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight"
          >
            Premium{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
              Pet Care
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10"
          >
            Everything your furry friend needs — from premium products and expert
            veterinary care to grooming and pet adoption.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-base px-10"
              onClick={() => navigate('/shop')}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shop Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-base px-10"
              onClick={() => navigate('/adoption')}
            >
              <PawPrint className="h-5 w-5 mr-2" />
              Adopt a Pet
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex items-center justify-center gap-8 text-blue-200 text-sm"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-300" />
              Free Shipping
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-300" />
              Vet Approved
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-300" />
              24/7 Support
            </span>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { icon: Heart, value: 10, suffix: 'K+', label: 'Pets Helped' },
              { icon: ShoppingBag, value: 500, suffix: '+', label: 'Products' },
              { icon: Award, value: 50, suffix: '+', label: 'Expert Vets' },
              { icon: Users, value: 1000, suffix: '+', label: 'Happy Customers' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <stat.icon className="h-8 w-8 text-blue-200" />
                <span className="text-4xl font-bold">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-blue-200 text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container px-4">
          <SectionTitle>Featured Products</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              : featuredProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/shop/${product._id}`}>
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                        <CardContent className="p-0">
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3.5 w-3.5 ${j < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({product.numReviews})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
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
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button size="lg" onClick={() => navigate('/shop')}>
              View All Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pet Adoption */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <Badge className="mb-4 bg-green-600 text-white">Adoption</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Give a Pet a <span className="text-green-600">Loving Home</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg">
                Every pet deserves a forever home. Browse our adoption gallery
                and find your new best friend. Our adoption process is simple,
                transparent, and filled with love.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Thorough health check-ups for every pet',
                  'Vaccination and microchipping included',
                  'Post-adoption support and guidance',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/adoption')}
              >
                <PawPrint className="h-5 w-5 mr-2" />
                View Pets for Adoption
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 flex justify-center"
            >
              <div className="relative">
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-800 flex items-center justify-center">
                  <PawPrint className="h-32 w-32 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  ❤️
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Veterinary Services */}
      <section className="py-20">
        <div className="container px-4">
          <SectionTitle>Veterinary Services</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Stethoscope,
                title: 'General Checkups',
                desc: 'Regular health examinations to keep your pet in peak condition.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Heart,
                title: 'Vaccinations',
                desc: 'Comprehensive vaccination programs tailored to your pet.',
                color: 'from-red-500 to-red-600',
              },
              {
                icon: Shield,
                title: 'Emergency Care',
                desc: '24/7 emergency services for when your pet needs immediate attention.',
                color: 'from-purple-500 to-purple-600',
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white`}
                    >
                      <service.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {service.desc}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/veterinary')}
                      className="group"
                    >
                      Book Appointment
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grooming Services */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
        <div className="container px-4">
          <SectionTitle>Grooming Services</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Scissors,
                title: 'Bathing',
                desc: 'Luxury bath with premium shampoos',
                price: '$25+',
              },
              {
                icon: Scissors,
                title: 'Hair Cutting',
                desc: 'Professional styling for all breeds',
                price: '$40+',
              },
              {
                icon: Scissors,
                title: 'Nail Trimming',
                desc: 'Safe and gentle nail care',
                price: '$15+',
              },
              {
                icon: Scissors,
                title: 'Full Grooming',
                desc: 'Complete grooming package',
                price: '$75+',
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white">
                      <Scissors className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {service.desc}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {service.price}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
              onClick={() => navigate('/grooming')}
            >
              Book Grooming Session
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-4">
          <SectionTitle>What Pet Parents Say</SectionTitle>

          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {testimonials[testimonialIndex].avatar}
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: testimonials[testimonialIndex].rating }).map(
                    (_, j) => (
                      <Star
                        key={j}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>
                <blockquote className="text-lg md:text-xl italic text-muted-foreground mb-6">
                  &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
                </blockquote>
                <p className="font-bold">
                  {testimonials[testimonialIndex].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[testimonialIndex].role}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setTestimonialIndex((i) =>
                    i === 0 ? testimonials.length - 1 : i - 1
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === testimonialIndex
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setTestimonialIndex((i) =>
                    i === testimonials.length - 1 ? 0 : i + 1
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 max-w-3xl">
          <SectionTitle>Frequently Asked Questions</SectionTitle>

          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Subscribe to our newsletter for exclusive deals, pet care tips,
              and adoption stories.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 focus:ring-white"
              />
              <Button
                type="submit"
                className="bg-white text-blue-700 hover:bg-blue-50 shrink-0"
              >
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Give Your Pet the Best?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of happy pet parents who trust PET for all their
              pet care needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/shop')}>
                Start Shopping
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
