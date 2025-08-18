import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Layout as LayoutIcon,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePatientStore } from '@/store/usePatientStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useDocumentStore } from '@/store/useDocumentStore';

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const quickActions: QuickActionCard[] = [
  {
    title: 'מסמך חדש',
    description: 'צרי מסמך טיפול חדש עבור מטופל',
    href: '/documents?action=new',
    icon: FileText,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'ניהול מטופלים',
    description: 'הוסיפי מטופל חדש או עדכני פרטים',
    href: '/patients',
    icon: Users,
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'ניהול תבניות',
    description: 'צרי או ערכי תבניות מסמכים',
    href: '/templates',
    icon: LayoutIcon,
    gradient: 'from-purple-500 to-purple-600',
  },
];

export const HomePage: React.FC = () => {
  const { patients } = usePatientStore();
  const { templates } = useTemplateStore();
  const { documents } = useDocumentStore();

  // Calculate real statistics
  const totalPatients = patients.length;
  const thisWeekDocuments = documents.filter(d => {
    const createdDate = typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt;
    return !isNaN(createdDate.getTime()) && 
           createdDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;
  const activeTemplates = templates.filter(t => t.isActive).length;
  
  // Calculate recent treatments
  const thisWeekTreatments = patients.filter(p => 
    p.medicalHistory?.some(record => {
      const recordDate = typeof record.date === 'string' ? new Date(record.date) : record.date;
      return !isNaN(recordDate.getTime()) && recordDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    })
  ).length;

  return (
    <div className="space-y-12">
      {/* Welcome Section - Medical Professional Design */}
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            שלום צפי! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            ברוכה הבאה למערכת ניהול המסמכים המקצועית שלך. 
            <br />
            כל מה שאת צריכה לניהול יעיל של הקליניקה - במקום אחד.
          </p>
        </div>
      </div>

      {/* Large Action Buttons - Medical Theme */}
      <div className="grid md:grid-cols-3 gap-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              to={action.href}
              className={cn(
                "block group transition-all duration-300 hover:scale-105"
              )}
            >
              <div className="card h-full flex flex-col">
                <div className={cn(
                  "p-6 rounded-t-2xl bg-gradient-to-r text-white",
                  action.gradient
                )}>
                  <Icon className="h-12 w-12 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-center mb-2">
                    {action.title}
                  </h3>
                </div>
                <div className="p-6 flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-center text-lg leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Statistics Dashboard - Medical Style */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card-compact group hover:bg-blue-50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">מטופלים פעילים</p>
              <p className="text-3xl font-bold text-gray-800">{totalPatients}</p>
              <p className="text-xs text-gray-400 mt-1">סה&quot;כ במערכת</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-compact group hover:bg-green-50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">מסמכים השבוע</p>
              <p className="text-3xl font-bold text-gray-800">{thisWeekDocuments}</p>
              <p className="text-xs text-gray-400 mt-1">נוצרו השבוע</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-compact group hover:bg-purple-50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">תבניות פעילות</p>
              <p className="text-3xl font-bold text-gray-800">{activeTemplates}</p>
              <p className="text-xs text-gray-400 mt-1">מוכנות לשימוש</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
              <LayoutIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card-compact group hover:bg-orange-50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">טיפולים השבוע</p>
              <p className="text-3xl font-bold text-gray-800">{thisWeekTreatments}</p>
              <p className="text-xs text-gray-400 mt-1">מתוכננים</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                מסמכים אחרונים
              </h3>
              <Link 
                to="/documents" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                הצגת הכל →
              </Link>
            </div>
          </div>
          <div className="card-content">
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">אין מסמכים עדיין</p>
              <p className="text-sm mt-2">המסמכים שתיצרי יופיעו כאן</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              פעולות מהירות
            </h3>
          </div>
          <div className="card-content space-y-4">
            <Link 
              to="/patients/new"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">הוספת מטופל חדש</h4>
                <p className="text-sm text-gray-600">רישום מטופל חדש במערכת</p>
              </div>
            </Link>

            <Link 
              to="/documents?action=new"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">יצירת מסמך מהיר</h4>
                <p className="text-sm text-gray-600">מילוי מסמך טיפול חדש</p>
              </div>
            </Link>

            <Link 
              to="/templates"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <LayoutIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">עריכת תבניות</h4>
                <p className="text-sm text-gray-600">התאמת תבניות המסמכים</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started Guide - Medical Professional */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-2xl border border-blue-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              מתחילה עם המערכת?
            </h2>
            <p className="text-gray-600">
              עקבי אחר השלבים הפשוטים האלה כדי להתחיל לנהל את הקליניקה דיגיטלית
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">הוסיפי מטופלים</h4>
                <p className="text-gray-600 leading-relaxed">
                  התחילי ברישום המטופלים הקבועים שלך כדי לארגן את המידע במקום אחד ונגיש
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">צרי תבניות מותאמות</h4>
                <p className="text-gray-600 leading-relaxed">
                  הכיני תבניות מסמכים לסוגי הטיפולים השונים שלך כדי לחסוך זמן בכל טיפול
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">התחילי לתעד טיפולים</h4>
                <p className="text-gray-600 leading-relaxed">
                  השתמשי בתבניות ליצירת מסמכי טיפול מקצועיים ומפורטים בקלות ובמהירות
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">ייצאי ושמרי</h4>
                <p className="text-gray-600 leading-relaxed">
                  ייצאי מסמכים ל-PDF או Word לשליחה למטופלים, לביטוח או לתיעוד אישי
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};