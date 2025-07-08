import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface InitialLoadingScreenProps {
  message: string;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex items-center space-x-4 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        <h1 className="text-3xl font-bold text-on-surface">CineStream Pro</h1>
      </div>
      <LoadingSpinner />
      <p className="text-on-surface-variant mt-6 text-center px-4">{message}</p>
    </div>
  );
};
