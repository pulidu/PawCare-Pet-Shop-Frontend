import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Loader from '@/components/layout/Loader';

import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserProtectedRoute from '@/components/auth/UserProtectedRoute';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// Public pages
import LandingPage from '@/pages/landing/LandingPage';
import ContactPage from '@/pages/landing/ContactPage';
import ShopPage from '@/pages/store/ShopPage';
import ProductDetailPage from '@/pages/store/ProductDetailPage';
import CartPage from '@/pages/cart/CartPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage';

// User pages (require user role)
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import OrderConfirmationPage from '@/pages/checkout/OrderConfirmationPage';
import AdoptionPage from '@/pages/adoption/AdoptionPage';
import PetDetailPage from '@/pages/adoption/PetDetailPage';
import VeterinaryPage from '@/pages/veterinary/VeterinaryPage';
import GroomingPage from '@/pages/grooming/GroomingPage';
import BoardingPage from '@/pages/boarding/BoardingPage';
import SearchPage from '@/pages/search/SearchPage';

// User Dashboard
import UserDashboard from '@/pages/dashboard/Dashboard';
import UserOrders from '@/pages/dashboard/Orders';
import UserAdoptionRequests from '@/pages/dashboard/AdoptionRequests';
import UserAppointments from '@/pages/dashboard/Appointments';
import UserPets from '@/pages/dashboard/Pets';
import UserWishlist from '@/pages/dashboard/Wishlist';
import UserNotifications from '@/pages/dashboard/Notifications';
import UserProfile from '@/pages/profile/ProfilePage';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminProducts from '@/pages/admin/Products';
import AdminOrders from '@/pages/admin/Orders';
import AdminCategories from '@/pages/admin/Categories';
import AdminDoctors from '@/pages/admin/Doctors';
import AdminAppointments from '@/pages/admin/Appointments';
import AdminAdoptionRequests from '@/pages/admin/AdoptionRequests';
import AdminGrooming from '@/pages/admin/Grooming';
import AdminBoarding from '@/pages/admin/Boarding';

export default function AppRoutes() {
  const { isLoading } = useAuthStore();
  if (isLoading) return <Loader />;

  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="adoption" element={<AdoptionPage />} />
        <Route path="adoption/:id" element={<PetDetailPage />} />
        <Route path="veterinary" element={<VeterinaryPage />} />
        <Route path="grooming" element={<GroomingPage />} />
        <Route path="boarding" element={<BoardingPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>

      {/* ===== USER AUTH ROUTES ===== */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
        <Route index element={<Navigate to="/auth/login" replace />} />
      </Route>

      {/* ===== USER-PROTECTED ROUTES (users + staff only) ===== */}
      <Route path="/checkout" element={<UserProtectedRoute><MainLayout /></UserProtectedRoute>}>
        <Route index element={<CheckoutPage />} />
      </Route>
      <Route path="/order-confirmation/:id" element={<UserProtectedRoute><MainLayout /></UserProtectedRoute>}>
        <Route index element={<OrderConfirmationPage />} />
      </Route>

      {/* ===== USER DASHBOARD (users + staff only) ===== */}
      <Route path="/dashboard" element={<UserProtectedRoute><DashboardLayout /></UserProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="adoption-requests" element={<UserAdoptionRequests />} />
        <Route path="appointments" element={<UserAppointments />} />
        <Route path="pets" element={<UserPets />} />
        <Route path="wishlist" element={<UserWishlist />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      {/* ===== USER PROFILE ===== */}
      <Route path="/profile" element={<UserProtectedRoute><DashboardLayout /></UserProtectedRoute>}>
        <Route index element={<UserProfile />} />
      </Route>

      {/* ===== ADMIN LOGIN redirects to unified login ===== */}
      <Route path="/admin/login" element={<Navigate to="/auth/login" replace />} />

      {/* ===== ADMIN DASHBOARD (admin only) ===== */}
      <Route path="/admin" element={<AdminProtectedRoute><DashboardLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="adoption-requests" element={<AdminAdoptionRequests />} />
        <Route path="grooming" element={<AdminGrooming />} />
        <Route path="boarding" element={<AdminBoarding />} />
      </Route>

      {/* ===== ADMIN CAN ACCESS USER PAGES ===== */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ===== 404 ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
