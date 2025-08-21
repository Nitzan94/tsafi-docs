import React from 'react';
import { Settings, Save, Download, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">הגדרות מערכת</h1>
        </div>
        
        <div className="space-y-6">
          {/* הגדרות כלליות */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">הגדרות כלליות</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">שמירה אוטומטית</h3>
                <p className="text-sm text-gray-600 mb-3">שמירה אוטומטית של מסמכים כל 30 שניות</p>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="ml-2" />
                  <span className="text-sm">מופעל</span>
                </label>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">גיבוי מקומי</h3>
                <p className="text-sm text-gray-600 mb-3">יצירת גיבוי יומי במחשב</p>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="ml-2" />
                  <span className="text-sm">מופעל</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* פעולות מערכת */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">פעולות מערכת</h2>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="h-4 w-4" />
                שמור הגדרות
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="h-4 w-4" />
                יצא גיבוי
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <RefreshCw className="h-4 w-4" />
                אפס הגדרות
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};