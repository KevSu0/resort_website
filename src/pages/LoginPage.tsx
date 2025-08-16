import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { signIn } from '../hooks/useAuth';
import { toast } from '../hooks/useToast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({ title: 'Login Successful', description: 'Welcome back!', variant: 'success' });
      navigate('/admin');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      backgroundImage="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20resort%20lobby%20elegant%20interior%20marble%20floors%20chandelier%20warm%20lighting%20modern%20design&image_size=landscape_16_9"
    >
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </AuthLayout>
  );
}
