import React from 'react';

const Spinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex justify-center items-center space-x-2">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
    <span className="text-stone-600 font-medium">{message}</span>
  </div>
);

export default Spinner;
