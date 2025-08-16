import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { signIn, signUp } from '../hooks/useAuth';
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
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // A simple way to allow user creation for testing
  const handleSignUp = async (data: { email: string; password: string; }) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password);
      toast({ title: 'Sign Up Successful', description: 'You can now log in.', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
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
      <LoginForm onSubmit={handleLogin} onSignUp={handleSignUp} isLoading={isLoading} />
    </AuthLayout>
  );
}
