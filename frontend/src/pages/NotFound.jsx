import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/">
          <Button className="flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </button>
      </div>
    </div>
  );
};

export default NotFound;