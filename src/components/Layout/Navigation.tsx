import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Layout as LayoutIcon,
  StickyNote,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQuickNotesStore } from '@/store/useQuickNotesStore';

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
  
  // מצב עבור הערות מהירות
  const { addNote, deleteNote, getAllNotes, error } = useQuickNotesStore();
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // פונקציה להוספת הערה
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote(newNoteContent);
      setNewNoteContent('');
    }
  };
  
  // פונקציה לטיפול ב-Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNote();
    }
  };

  return (
    <nav className={cn(
      "fixed right-0 top-[7.5rem] h-[calc(100vh-7.5rem)]",
      "w-72 bg-white border-l border-gray-200",
      "shadow-sm z-40",
      "overflow-y-auto"
    )}>
      <div className="px-8 py-6">
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

      {/* Quick Notes */}
      <div className="mt-6 px-8 py-6 border-t border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <StickyNote className="h-4 w-4" />
          הערות מהירות
        </h3>
        
        {/* שדה הוספת הערה */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="הקלידי הערה מהירה..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        
        {/* רשימת הערות */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {getAllNotes().length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">אין הערות עדיין</p>
            </div>
          ) : (
            getAllNotes().map((note) => (
              <div key={note.id} className="flex items-start gap-2 p-3 bg-white rounded-lg group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed break-words">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleDateString('he-IL', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Medical Footer */}
      <div className="mt-6 px-8 py-6 border-t border-gray-100">
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