import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Award } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] min-h-screen flex flex-col justify-center items-center px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12 animate-fade-in">
        <Award className="h-10 w-10 text-pink-500" />
        <span className="text-3xl font-bold text-white">QuizNova</span>
      </div>
      
      <div className="w-full max-w-md relative animate-fade-in">
        {/* Background Effects - Matching dashboard's style */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        
        {/* Login Card - Matching dashboard card styling */}
        <Card
          className="w-full relative z-10 bg-[#1f2937] backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-gray-700/50"
        >
          <div className="p-8 pb-4 text-center">
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
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
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-xl transition-all duration-300 text-gray-200 placeholder-gray-500 ${
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button - Using dashboard gradient style */}
            <Button
              type="submit"
              fullWidth
              disabled={formLoading}
              className={`flex justify-center items-center bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
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
          <div className="mt-4 text-center pb-8">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Start free
              </Link>
            </p>
          </div>
        </Card>
      </div>
      
      {/* Social Sign-in Options - Styled similar to dashboard cards */}
      <div className="mt-10 w-full max-w-md animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-center mb-4">
          <div className="flex-grow h-px bg-gray-700/50"></div>
          <span className="px-4 text-sm text-gray-400">Or continue with</span>
          <div className="flex-grow h-px bg-gray-700/50"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {['Google', 'Microsoft', 'Apple'].map((provider, index) => (
            <button
              key={provider}
              className="flex justify-center items-center py-3 px-4 rounded-xl bg-[#0f172a] hover:bg-[#172135] border border-gray-700/50 text-gray-300 text-sm transition-all hover:shadow-lg transform hover:-translate-y-1"
              style={{ animationDelay: `${300 + (index * 100)}ms` }}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "500ms" }}>
        <p>© 2025 QuizNova. All rights reserved.</p>
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
`;
document.head.appendChild(styleElement);

export default Login;