import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../admin/components/AdminLayout';
import { Dashboard } from '../../admin/components/Dashboard';
import { useAuth } from '../../hooks/admin/useAuth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};