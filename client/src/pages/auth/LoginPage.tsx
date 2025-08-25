import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { Button, Input, Card } from '@/components/ui';
import { Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digital Claims Management System
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              fullWidth
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Test Credentials:</p>
                <p className="text-gray-600">Policyholder: user@example.com / password123</p>
                <p className="text-gray-600">Adjuster: adjuster@example.com / password123</p>
                <p className="text-gray-600">Supervisor: supervisor@example.com / password123</p>
                <p className="text-gray-600">Admin: admin@example.com / password123</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
