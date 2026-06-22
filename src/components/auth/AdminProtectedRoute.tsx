import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Loader from '@/components/layout/Loader';

interface Props {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
