import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../admin/components/AuthLayout';
import { Login } from '../../admin/components/Login';
import { FirstRunSetup } from '../../admin/components/FirstRunSetup';
import { useAuth } from '../../hooks/admin/useAuth';
import { authService } from '../../admin/services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isFirstRun, setIsFirstRun] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsFirstRun(!authService.isSetupComplete());
  }, []);

  if (isFirstRun) {
    return <FirstRunSetup />;
  }

  return (
    <AuthLayout>
      <Login onSuccess={() => navigate('/admin')} />
    </AuthLayout>
  );
};