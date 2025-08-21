import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { cn } from '@/utils/cn';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile } = useMobileNavigation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className={cn(
          "flex-1 transition-all duration-200",
          // Mobile: padding קטן יותר, ללא margin
          isMobile ? "p-4" : "p-8",
          // Desktop: margin עבור הסיידבר  
          isMobile ? "mr-0" : "lg:mr-72"
        )}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};