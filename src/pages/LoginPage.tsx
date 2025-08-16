import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      console.log('Login attempt:', data);
      setIsLoading(false);
      // Here you would typically handle the actual login logic
      // e.g., call your authentication API
    }, 2000);
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
