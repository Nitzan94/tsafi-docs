import React from 'react';
import { User, Settings, Activity, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';

export const Header: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, isMobile } = useMobileNavigation();
  
  return (
    <header className={cn(
      "bg-white border-b border-gray-200",
      "sticky top-0 z-50",
      "shadow-sm"
    )}>
      <div className="flex items-center justify-between min-h-20 py-4 px-4 md:px-8">
        {/* Mobile Menu + Logo - Left Side */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - Mobile Only */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200",
                isSidebarOpen 
                  ? "bg-blue-100 text-blue-600" 
                  : "text-gray-600 hover:text-gray-800"
              )}
              aria-label={isSidebarOpen ? "סגור תפריט" : "פתח תפריט"}
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
          
          <div className="p-3 bg-blue-100 rounded-xl">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Center - Clinic Title with Link */}
        <div className="flex items-center flex-1 justify-center px-2">
          <a href="/" className="flex flex-col items-center text-center group">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
              קליניקת צפי
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block">
              מערכת ניהול מסמכים מקצועית
            </div>
          </a>
        </div>

        {/* User Actions - Medical Professional */}
        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            className={cn(
              "p-3 rounded-xl text-gray-500",
              "hover:bg-gray-100 hover:text-gray-700",
              "transition-all duration-200",
              "relative group"
            )}
            title="הגדרות מערכת"
          >
            <Settings className="h-5 w-5" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              הגדרות
            </span>
          </button>
          
          {/* User Profile - Medical Professional */}
          <div className="flex items-center gap-2 lg:gap-3 bg-blue-50 rounded-xl px-2 lg:px-4 py-2">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-gray-800">
                צפי בר-נס
              </div>
              <div className="text-xs text-gray-500">
                פיזיותרפיסטית מוסמכת
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};