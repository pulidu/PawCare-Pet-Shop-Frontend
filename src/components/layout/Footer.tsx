import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PawPrint, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Globe } from 'lucide-react';

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/shop' },
      { label: 'Dog Food', href: '/shop?category=dog-food' },
      { label: 'Cat Food', href: '/shop?category=cat-food' },
      { label: 'Accessories', href: '/shop?category=accessories' },
      { label: 'Pet Toys', href: '/shop?category=toys' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Veterinary', href: '/services/veterinary' },
      { label: 'Grooming', href: '/services/grooming' },
      { label: 'Boarding', href: '/services/boarding' },
      { label: 'Adoption', href: '/pets' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { icon: Globe, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Globe, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Globe, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Globe, href: 'https://youtube.com', label: 'Youtube' },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <PawPrint className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold gradient-text">PET</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your trusted pet store for all your furry friends&apos; needs. We
              provide quality products, veterinary services, grooming, and more.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Pet Street, Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@petshop.lk</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PET. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-9 w-56 text-sm"
              />
              <Button size="sm" className="gap-1">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
  //footer with company info, contact details, social links, navigation links, and newsletter subscription form
}
