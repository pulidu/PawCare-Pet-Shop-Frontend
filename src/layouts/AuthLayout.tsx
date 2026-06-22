import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Loader from '@/components/layout/Loader';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <Loader />;
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Link to="/" className="mb-8">
        <h1 className="text-4xl font-extrabold gradient-text">PET</h1>
        <p className="text-sm text-muted-foreground text-center">Premium Pet Shop & Care</p>
      </Link>
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
