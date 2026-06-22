import { useEffect } from 'react';
import { useAuthStore, useThemeStore } from '@/store/authStore';
import AppRoutes from '@/routes';
import api from '@/services/api';
import type { IUser } from '@/types';

export default function App() {
  const { setUser, setLoading, setAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        const userData = data?.user || data;
        setUser(userData as IUser);
        setAuthenticated(true);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [setUser, setLoading, setAuthenticated]);

  return <AppRoutes />;
}
