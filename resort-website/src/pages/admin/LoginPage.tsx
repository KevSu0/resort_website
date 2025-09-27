import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../../admin/components/Login';
import { useAuth } from '../../hooks/admin/useAuth';
import { FirstRunSetup } from '../../admin/components/FirstRunSetup';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if setup is needed
    const isSetup = localStorage.getItem('admin_setup_complete');
    if (isSetup !== 'true') {
      // Don't redirect, show first-run setup
      return;
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const isSetup = localStorage.getItem('admin_setup_complete');

  if (isSetup !== 'true') {
    return <FirstRunSetup />;
  }

  const handleLoginSuccess = () => {
    navigate('/admin');
  };

  return <Login onSuccess={handleLoginSuccess} />;
};