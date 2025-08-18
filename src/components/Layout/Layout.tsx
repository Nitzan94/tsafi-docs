import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { cn } from '@/utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className={cn(
          "flex-1 p-8",
          "transition-all duration-200",
          "lg:mr-64" // Account for sidebar width
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};