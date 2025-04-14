import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      {/* Header Section with similar styling to dashboard */}
      <section className="relative w-full max-w-lg mx-auto py-12 px-8 overflow-hidden bg-[#1f1f1f] rounded-3xl shadow-xl mb-12 text-center">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-7xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-6">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
      </section>

      {/* Action buttons with dashboard styling */}
      <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">What would you like to do?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/" className="block">
            <div className="bg-[#0f172a] p-6 rounded-2xl h-full transform hover:-translate-y-2 transition duration-300 hover:shadow-lg hover:shadow-pink-500/10 flex flex-col items-center">
              <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Go Home</h3>
              <p className="text-sm text-gray-400 mb-4 text-center">Return to the dashboard</p>
              <Button 
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white mt-auto"
              >
                Dashboard
              </Button>
            </div>
          </Link>
          
          <div 
            onClick={() => window.history.back()} 
            className="bg-[#0f172a] p-6 rounded-2xl h-full transform hover:-translate-y-2 transition duration-300 hover:shadow-lg hover:shadow-pink-500/10 flex flex-col items-center cursor-pointer"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <ArrowLeft className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Go Back</h3>
            <p className="text-sm text-gray-400 mb-4 text-center">Return to previous page</p>
            <Button 
              fullWidth
              variant="outline" 
              className="border-pink-500 text-pink-400 hover:bg-pink-500/20 transition-colors mt-auto"
            >
              Previous Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;