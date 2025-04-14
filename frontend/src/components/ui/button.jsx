import React from 'react';

export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-2xl shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
