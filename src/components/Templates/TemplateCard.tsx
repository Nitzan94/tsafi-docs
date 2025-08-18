import React from 'react';
import { 
  Layout,
  FileText,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatHebrewDate } from '@/utils/hebrew';
import type { Template } from '@/types/template';
import { TEMPLATE_CATEGORIES } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onUse?: (template: Template) => void;
  onExportToWord?: (template: Template) => void;
  className?: string;
}

const getCategoryColor = (category: string) => {
  const colors = {
    assessment: 'bg-blue-100 text-blue-700 border-blue-200',
    treatment: 'bg-green-100 text-green-700 border-green-200',
    progress: 'bg-purple-100 text-purple-700 border-purple-200',
    discharge: 'bg-orange-100 text-orange-700 border-orange-200',
    exercise: 'bg-teal-100 text-teal-700 border-teal-200',
    referral: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    certificate: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    invoice: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    insurance: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    custom: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[category as keyof typeof colors] || colors.custom;
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onUse,
  onExportToWord,
  className
}) => {
  const categoryLabel = TEMPLATE_CATEGORIES[template.category] || template.category;
  const fieldCount = template.fields.length;
  
  return (
    <div className={cn(
      "card-compact group cursor-pointer",
      "transition-all duration-200",
      "hover:shadow-lg hover:scale-105",
      !template.isActive && "opacity-60 bg-gray-50",
      className
    )}>
      {/* Template Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
            <Layout className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {template.description}
            </p>
            
            {/* Category Badge */}
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
              getCategoryColor(template.category)
            )}>
              {categoryLabel}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExportToWord?.(template);
            }}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="יצוא תבנית לWord"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="תצוגה מקדימה"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(template);
            }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="עריכת תבנית"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(template);
            }}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="שכפול תבנית"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(template);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="מחיקת תבנית"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Template Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>שדות</span>
          </div>
          <span className="font-semibold text-gray-800">
            {fieldCount}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>שימושים</span>
          </div>
          <span className="font-semibold text-gray-800">
            {template.usageCount}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>עודכן</span>
          </div>
          <span className="font-semibold text-gray-800">
            {formatHebrewDate(template.updatedAt, 'dd/MM/yy')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span>גרסה</span>
          </div>
          <span className="font-semibold text-gray-800">
            {template.version}
          </span>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            template.isActive ? "bg-green-500" : "bg-gray-400"
          )}></div>
          <span className="text-xs text-gray-500">
            {template.isActive ? "פעילה" : "לא פעילה"}
          </span>
        </div>

        {/* Use Template Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUse?.(template);
          }}
          disabled={!template.isActive}
          className={cn(
            "text-xs font-medium transition-colors",
            template.isActive
              ? "text-blue-600 hover:text-blue-800"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          {template.isActive ? "השתמש בתבנית →" : "לא זמינה"}
        </button>
      </div>
    </div>
  );
};