import React from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Edit,
  Trash2,
  Download,
  Eye,
  Copy,
  Clock,
  CheckCircle,
  FileSignature,
  Archive
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatHebrewDate } from '@/utils/hebrew';
import { usePatientStore } from '@/store/usePatientStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import type { Document } from '@/types/template';
import { DOCUMENT_STATUS_LABELS, TEMPLATE_CATEGORIES } from '@/types/template';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDuplicate?: (document: Document) => void;
  onPreview?: (document: Document) => void;
  onExport?: (document: Document, format: 'pdf' | 'docx') => void;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onExport,
  className
}) => {
  const { getPatient } = usePatientStore();
  const { getTemplate } = useTemplateStore();
  
  const patient = getPatient(document.patientId);
  const template = getTemplate(document.templateId);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'signed':
        return <FileSignature className="h-4 w-4 text-blue-600" />;
      case 'exported':
        return <Download className="h-4 w-4 text-purple-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'signed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'exported':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div 
      className={cn(
        "card-compact group cursor-pointer",
        "transition-all duration-200",
        "hover:shadow-lg hover:scale-105",
        className
      )}
      onClick={() => onPreview?.(document)}
    >
      {/* Document Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {document.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                getStatusColor(document.status)
              )}>
                {getStatusIcon(document.status)}
                {DOCUMENT_STATUS_LABELS[document.status]}
              </span>
              <span className="text-xs text-gray-500">
                גרסה {document.version}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(document);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="תצוגה מקדימה"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(document);
            }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="עריכת מסמך"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(document);
            }}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="שכפל מסמך"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(document);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="מחיקת מסמך"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4 text-blue-600" />
          <span className="font-medium">
            {patient ? `${patient.firstName} ${patient.lastName}` : 'מטופל לא נמצא'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4 text-green-600" />
          <span>
            {template ? template.name : 'תבנית לא נמצאה'}
          </span>
          {template && (
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
              {TEMPLATE_CATEGORIES[template.category]}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-purple-600" />
          <span>נוצר: {formatHebrewDate(document.createdAt, 'dd/MM/yyyy')}</span>
        </div>

        {document.updatedAt !== document.createdAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>עודכן: {formatHebrewDate(document.updatedAt, 'dd/MM/yyyy HH:mm')}</span>
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {document.tags && document.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {document.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{document.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport?.(document, 'pdf');
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            title="ייצוא ל-PDF"
          >
            <Download className="h-3 w-3" />
            PDF
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport?.(document, 'docx');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            title="ייצוא ל-Word"
          >
            <Download className="h-3 w-3" />
            Word
          </button>
        </div>
      </div>

      {/* Signed Info */}
      {document.signedBy && document.signedAt && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileSignature className="h-3 w-3" />
            <span>
              נחתם על ידי {document.signedBy} ב-{formatHebrewDate(document.signedAt, 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};