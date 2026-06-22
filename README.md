# PET - Premium Pet Shop & Pet Care Management Platform

A full-featured pet shop and pet care management platform built with React, TypeScript, and Vite.

## Features

- **Store** - Browse and purchase pet products with cart and checkout
- **Pet Adoption** - Browse adoptable pets and submit adoption requests
- **Pet Boarding** - Book boarding services for your pets
- **Grooming Services** - Schedule professional grooming appointments
- **Veterinary Care** - Book vet appointments and manage pet health records
- **User Dashboard** - Manage orders, pets, wishlist, and profile
- **Admin Panel** - Manage products, orders, users, appointments, and more
- **Authentication** - JWT-based auth with login, register, email verification, and password reset
- **Dark/Light Mode** - Theme toggle with persistent preference

## Tech Stack

- **Framework:** React 19 (RC), TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router DOM v6
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query, Axios
- **Forms:** React Hook Form, Zod validation
- **UI:** Tailwind CSS 3, Radix UI Primitives, shadcn/ui components
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Notifications:** react-hot-toast
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on [http://localhost:5173](http://localhost:5173). API requests are proxied to `http://localhost:5000`.

### Build

```bash
npm run build
```

Produces optimized output in the `dist/` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/   # UI components (admin, adoption, auth, cart, etc.)
├── layouts/      # Auth and Main layouts
├── lib/          # Utility functions
├── pages/        # Route pages (admin, adoption, auth, store, etc.)
├── routes/       # Route definitions
├── services/     # API client (Axios with JWT interceptors)
├── store/        # Zustand stores (auth, theme)
└── types/        # TypeScript interfaces
```

## Deploy

Live demo: [https://PawCare-Pet-Shop-Frontend.vercel.app/api/v1](https://PawCare-Pet-Shop-Frontend.vercel.app/api/v1)

## License

MIT
