import React from 'react';
import { User, Settings, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  return (
    <header className={cn(
      "bg-white border-b border-gray-200",
      "sticky top-0 z-50",
      "shadow-sm"
    )}>
      <div className="flex items-center justify-between h-20 px-8">
        {/* Logo - Left Side */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Center - Clinic Title with Link */}
        <div className="flex items-center">
          <a href="/" className="flex flex-col items-center text-center group">
            <div className="text-2xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
              קליניקת צפי
            </div>
            <div className="text-sm text-gray-500 font-medium">
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
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">
                צפי בר-נס
              </div>
              <div className="text-xs text-gray-500">
                פיזיותרפיסטית מוסמכת
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Bar - Medical Dashboard */}
      <div className="border-t border-gray-100 bg-gray-50 px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">מטופלים פעילים: <span className="font-semibold text-gray-800">0</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">טיפולים השבוע: <span className="font-semibold text-gray-800">0</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">מסמכים חדשים: <span className="font-semibold text-gray-800">0</span></span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
          </div>
        </div>
      </div>
    </header>
  );
};