import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => (
  <div className={`w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin ${className ?? ''}`}></div>
);