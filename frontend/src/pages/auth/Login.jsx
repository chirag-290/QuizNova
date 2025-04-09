import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const Login = () => {
  const { login, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setFormLoading(true);
    const success = await login(data);
    setFormLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card
        className="w-full bg-white/90 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden border border-gray-200/50 animate-fade-in"
        title={<h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>}
        subtitle={<p className="text-gray-600 mt-2">Sign in to continue</p>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-300 ${
                errors.email ? 'border-red-400' : 'border-gray-200 hover:border-indigo-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
              placeholder="your@email.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 animate-fade-up">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-300 ${
                errors.password ? 'border-red-400' : 'border-gray-200 hover:border-indigo-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 animate-fade-up">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            disabled={formLoading}
            className={`flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
              formLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {formLoading ? (
              <Spinner size="small" className="text-white" />
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-4 text-center pb-6">
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
            >
              Join now
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;