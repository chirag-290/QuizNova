import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Award } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] min-h-screen flex flex-col justify-center items-center px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in">
        <Award className="h-8 w-8 text-pink-500" />
        <span className="text-2xl font-bold text-white">ExamFlow</span>
      </div>
      
      <div className="w-full max-w-md relative">
        {/* Background Effects */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        
        {/* Register Card */}
        <Card
          className="w-full relative z-10 bg-[#1f2937] backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-gray-700/50 animate-fade-in"
        >
          <div className="p-8 pb-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Join Us Today</h2>
            <p className="text-gray-400">Create your account in minutes</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full px-4 py-3 bg-[#111827] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
                  errors.name ? 'border-red-400' : 'border-gray-600 hover:border-pink-500/50'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent`}
                placeholder="John Doe"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-400 animate-fade-up">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 bg-[#111827] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
                  errors.email ? 'border-red-400' : 'border-gray-600 hover:border-pink-500/50'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent`}
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
                <p className="mt-2 text-sm text-red-400 animate-fade-up">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-4 py-3 bg-[#111827] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
                  errors.password ? 'border-red-400' : 'border-gray-600 hover:border-pink-500/50'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 animate-fade-up">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-4 py-3 bg-[#111827] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-600 hover:border-pink-500/50'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 animate-fade-up">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <select
                id="role"
                className="w-full px-4 py-3 bg-[#111827] border border-gray-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300 hover:border-pink-500/50"
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
              className={`flex justify-center items-center bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
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
          <div className="mt-2 text-center pb-8">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
      
      {/* Optional: Social Sign-up Options */}
      <div className="mt-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="flex-grow h-px bg-gray-700/50"></div>
          <span className="px-4 text-sm text-gray-400">Or sign up with</span>
          <div className="flex-grow h-px bg-gray-700/50"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {['Google', 'Microsoft', 'Apple'].map((provider) => (
            <button
              key={provider}
              className="flex justify-center items-center py-2 px-4 rounded-xl bg-[#1f2937] hover:bg-[#2d3748] border border-gray-700/50 text-gray-300 text-sm transition-all hover:shadow-lg"
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500 animate-fade-in delay-500">
        <p>© 2025 ExamFlow. All rights reserved.</p>
      </div>
    </div>
  );
};

// Add custom animation styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s forwards;
  }
  
  .animate-fade-up {
    animation: fade-up 0.4s forwards;
  }
  
  .delay-200 {
    animation-delay: 0.2s;
  }
  
  .delay-300 {
    animation-delay: 0.3s;
  }
  
  .delay-500 {
    animation-delay: 0.5s;
  }
`;
document.head.appendChild(styleElement);

export default Register;