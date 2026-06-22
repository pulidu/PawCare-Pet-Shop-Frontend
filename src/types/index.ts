export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'staff';
  avatar?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  sku: string;
  description: string;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  brand: string;
  category: ICategory | string;
  rating: number;
  numReviews: number;
  isActive: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface ICartItem {
  product: string | IProduct;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  savedForLater: ICartItem[];
  coupon?: string;
  discount: number;
  totalPrice: number;
}

export interface IOrder {
  _id: string;
  user: IUser | string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface IOrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IPet {
  _id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  vaccinationStatus: boolean;
  healthCondition: string;
  description: string;
  images: string[];
  status: 'available' | 'adopted' | 'pending';
  addedBy: string;
  createdAt: string;
}

export interface IAdoptionRequest {
  _id: string;
  user: IUser | string;
  pet: IPet | string;
  reason: string;
  experience: string;
  hasOtherPets: boolean;
  otherPetsDetail?: string;
  livingSituation: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface IDoctor {
  _id: string;
  name: string;
  qualification: string;
  experience: number;
  specialization: string;
  profilePhoto?: string;
  bio: string;
  email: string;
  phone: string;
  isAvailable: boolean;
  consultationFee: number;
  availableDays: string[];
  availableSlots: { day: string; start: string; end: string }[];
}

export interface IAppointment {
  _id: string;
  user: IUser | string;
  doctor: IDoctor | string;
  pet?: IPet | string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface IGroomingBooking {
  _id: string;
  user: IUser | string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  serviceType: 'bathing' | 'hair-cutting' | 'nail-trimming' | 'full-grooming';
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
}

export interface IBoardingReservation {
  _id: string;
  user: IUser | string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petAge: number;
  checkIn: string;
  checkOut: string;
  roomType: 'standard' | 'deluxe' | 'suite';
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export interface IReview {
  _id: string;
  user: IUser | string;
  product: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'adoption' | 'appointment' | 'grooming' | 'boarding' | 'general';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IAuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  avatar?: string;
  isVerified: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalAppointments: number;
  totalAdoptionRequests: number;
}
