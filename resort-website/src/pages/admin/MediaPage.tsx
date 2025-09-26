import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../admin/components/AdminLayout';
import { MediaEditor } from '../../admin/components/editors/MediaEditor';
import { useAuth } from '../../hooks/admin/useAuth';

export const MediaPage: React.FC = () => {
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
      <MediaEditor />
    </AdminLayout>
  );
};