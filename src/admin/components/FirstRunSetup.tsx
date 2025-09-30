import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { authService } from '../services/authService';

export const FirstRunSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'create' | 'complete'>('welcome');
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check if setup is already completed
    const isSetup = localStorage.getItem('admin_setup_complete');
    if (isSetup === 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleCreateAdmin = async () => {
    setErrors([]);

    // Validate
    const validationErrors: string[] = [];
    if (!adminData.name.trim()) validationErrors.push('Name is required');
    if (!adminData.email.trim()) validationErrors.push('Email is required');
    if (!adminData.password) validationErrors.push('Password is required');
    if (adminData.password.length < 12) validationErrors.push('Password must be at least 12 characters');
    if (adminData.password !== adminData.confirmPassword) validationErrors.push('Passwords do not match');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Create admin user
      await authService.register({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password
      });

      // Mark setup as complete
      localStorage.setItem('admin_setup_complete', 'true');
      localStorage.setItem('admin_setup_time', new Date().toISOString());

      setStep('complete');
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to create admin account']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Setup
          </h2>
          <p className="mt-3 text-gray-600">
            {step === 'welcome' && 'Welcome to your resort website admin panel. Let\'s create your admin account.'}
            {step === 'create' && 'Create your administrator account'}
            {step === 'complete' && 'Setup complete!'}
          </p>
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                This setup will create the first administrator account. Make sure to use a strong password.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Full access to admin panel</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Manage content and media</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>View and respond to enquiries</span>
              </div>
            </div>

            <Button
              onClick={() => setStep('create')}
              className="w-full py-3"
            >
              Get Started
            </Button>
          </div>
        )}

        {/* Create Admin Step */}
        {step === 'create' && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
                <ul className="list-disc list-inside text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Must be at least 12 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold">Setup Complete!</h3>
            <p className="text-gray-600">
              Your admin account has been created successfully. You can now log in to manage your resort website.
            </p>
            <Button
              onClick={() => navigate('/admin/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};