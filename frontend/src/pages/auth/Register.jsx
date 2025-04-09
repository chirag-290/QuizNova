import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const Register = () => {
  const { register: registerUser, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setFormLoading(true);
    const { confirmPassword, ...userData } = data;
    const success = await registerUser(userData);
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
    <div className="min-h-screen flex items-center justify-center sm:px-6 lg:px-8">
      <Card
        className="max-w-md w-full bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-gray-200/50 animate-fade-in"
        title={<h2 className="text-3xl font-bold text-gray-800">Join Us Today</h2>}
        subtitle={<p className="text-gray-600 mt-2">Create your account in minutes</p>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-300 ${
                errors.name ? 'border-red-400' : 'border-gray-200 hover:border-indigo-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
              placeholder="John Doe"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 animate-fade-up">{errors.name.message}</p>
            )}
          </div>

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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-300 ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-200 hover:border-indigo-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 animate-fade-up">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 text-gray-700"
              {...register('role')}
            >
              <option value="Student">Student</option>
              <option value="Examiner">Examiner</option>
              <option value="Admin">Admin</option>
            </select>
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
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-4 text-center pb-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;