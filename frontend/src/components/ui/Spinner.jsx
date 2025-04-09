import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Spinner;