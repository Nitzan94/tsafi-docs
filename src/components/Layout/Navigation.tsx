import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Layout as LayoutIcon
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    href: '/',
    label: 'דף הבית',
    icon: Home,
  },
  {
    href: '/patients',
    label: 'מטופלים',
    icon: Users,
  },
  {
    href: '/templates',
    label: 'תבניות מסמכים',
    icon: LayoutIcon,
  },
  {
    href: '/documents',
    label: 'מסמכים',
    icon: FileText,
  },
];

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={cn(
      "fixed right-0 top-[7.5rem] h-[calc(100vh-7.5rem)]",
      "w-64 bg-white border-l border-gray-200",
      "shadow-sm z-40",
      "overflow-y-auto"
    )}>
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          תפריט ניווט
        </h2>
        
        <ul className="space-y-3">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3",
                    "px-4 py-3 rounded-xl text-sm font-medium",
                    "transition-all duration-200",
                    "group relative",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Medical Quick Stats */}
      <div className="mt-6 p-6 border-t border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          נתונים מהירים
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">מטופלים פעילים</span>
            <span className="font-bold text-blue-600">0</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">מסמכים השבוע</span>
            <span className="font-bold text-green-600">0</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600">תבניות פעילות</span>
            <span className="font-bold text-purple-600">0</span>
          </div>
        </div>
      </div>

      {/* Medical Footer */}
      <div className="mt-6 p-6 border-t border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600 font-bold text-lg">צ</span>
          </div>
          <p className="text-xs text-gray-500">
            קליניקת צפי
            <br />
            פיזיותרפיה מקצועית
          </p>
        </div>
      </div>
    </nav>
  );
};