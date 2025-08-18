import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  ArrowRight, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Edit3,
  Edit,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { usePatientStore } from '@/store/usePatientStore';
import { FieldRenderer } from '@/components/Documents/FieldRenderer';
import { DocumentPreview } from '@/components/Documents/DocumentPreview';
import type { DocumentStatus, TemplateField } from '@/types/template';
import { DOCUMENT_STATUS_LABELS } from '@/types/template';

export const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { documents, updateDocument } = useDocumentStore();
  const { templates } = useTemplateStore();
  const { patients } = usePatientStore();

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Get document, template and patient data
  const document = useMemo(() => {
    return documents.find(d => d.id === id);
  }, [documents, id]);

  const template = useMemo(() => {
    return document ? templates.find(t => t.id === document.templateId) : null;
  }, [templates, document]);

  const patient = useMemo(() => {
    return document ? patients.find(p => p.id === document.patientId) : null;
  }, [patients, document]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !document) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleSave(false); // Silent save
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, document]);

  // Navigate back if document not found
  useEffect(() => {
    if (id && !document) {
      navigate('/documents');
    }
  }, [id, document, navigate]);

  if (!document || !template || !patient) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">המסמך לא נמצא</h2>
          <p className="text-gray-600 mb-4">המסמך שחיפשת אינו קיים או הוסר מהמערכת</p>
          <button
            onClick={() => navigate('/documents')}
            className="btn btn-primary"
          >
            חזור למסמכים
          </button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setHasUnsavedChanges(true);
    updateDocument(document.id, {
      data: {
        ...document.data,
        [fieldName]: value
      }
    });
  };

  const handleSave = async (showFeedback: boolean = true) => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await updateDocument(document.id, {
        updatedAt: new Date(),
        status: document.status === 'draft' ? 'draft' : document.status
      });
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (showFeedback) {
        // TODO: Show success toast
        console.log('המסמך נשמר בהצלחה');
      }
    } catch (error) {
      console.error('שגיאה בשמירת המסמך:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    await updateDocument(document.id, { status: newStatus });
    await handleSave();
  };

  const handleTitleEdit = () => {
    setTempTitle(document.name);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (tempTitle.trim() && tempTitle !== document.name) {
      await updateDocument(document.id, { name: tempTitle.trim() });
      setHasUnsavedChanges(true);
    }
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!document || !template || !patient) {
      alert('שגיאה: חסרים נתונים למסמך');
      return;
    }

    if (format === 'docx') {
      try {
        const { WordDocumentExporter } = await import('@/utils/documentExportSimple');
        const exporter = new WordDocumentExporter({
          document,
          template,
          patient
        });
        
        await exporter.exportToWord();
      } catch (error) {
        console.error('Error exporting to Word:', error);
        alert(`שגיאה ביצוא קובץ Word: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      }
    } else if (format === 'pdf') {
      // TODO: Implement PDF export
      alert('יצוא PDF יתווסף בקרוב!');
    }
  };

  const getFieldValue = (field: TemplateField) => {
    return document.data?.[field.name] || field.defaultValue || '';
  };

  const isFieldRequired = (field: TemplateField) => {
    return field.required || field.validation?.required || false;
  };

  const getRequiredFieldsStatus = () => {
    if (!template.fields) return { total: 0, filled: 0 };
    
    const requiredFields = template.fields.filter(field => isFieldRequired(field));
    const filledFields = requiredFields.filter(field => {
      const value = getFieldValue(field);
      return value !== null && value !== undefined && value !== '';
    });

    return {
      total: requiredFields.length,
      filled: filledFields.length
    };
  };

  const { total: totalRequired, filled: filledRequired } = getRequiredFieldsStatus();
  const completionPercentage = totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="btn btn-ghost flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            חזור למסמכים
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit3 className="h-6 w-6 text-blue-600" />
              </div>
              עריכת מסמך
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleTitleSave}
                    className="input text-gray-600 flex-1 min-w-0"
                    placeholder="שם המסמך..."
                    autoFocus
                  />
                  <button
                    onClick={handleTitleSave}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="שמור"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="text-gray-500 hover:text-gray-600 p-1"
                    title="ביטול"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <p className="text-gray-600 truncate flex-1">{document.name}</p>
                  <button
                    onClick={handleTitleEdit}
                    className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                    title="ערוך כותרת"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600">שומר...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600">יש שינויים לא שמורים</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">
                  נשמר {lastSaved.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : null}
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={cn(
              "btn flex items-center gap-2",
              isPreviewMode ? "btn-ghost" : "btn-secondary"
            )}
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? 'חזור לעריכה' : 'תצוגה מקדימה'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={!hasUnsavedChanges || isSaving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            שמור
          </button>
        </div>
      </div>

      {/* Document Info Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">מטופל</p>
              <p className="text-sm text-gray-600">{patient.firstName} {patient.lastName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">תבנית</p>
              <p className="text-sm text-gray-600">{template.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">השלמה</p>
              <p className="text-sm text-gray-600">{completionPercentage}% ({filledRequired}/{totalRequired})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={document.status}
              onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
              className="input text-sm min-w-[120px]"
            >
              {Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>התקדמות מילוי שדות חובה</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                completionPercentage === 100 ? "bg-green-500" :
                completionPercentage >= 75 ? "bg-blue-500" :
                completionPercentage >= 50 ? "bg-yellow-500" : "bg-orange-500"
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor/Preview */}
        <div className="lg:col-span-2">
          {isPreviewMode ? (
            <DocumentPreview
              document={document}
              template={template}
              patient={patient}
              onExport={handleExport}
              onUpdateDocument={(updates) => updateDocument(document.id, updates)}
            />
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-800">מילוי פרטי המסמך</h3>
                <p className="text-sm text-gray-600 mt-1">
                  מלאי את השדות הנדרשים להשלמת המסמך
                </p>
              </div>
              <div className="card-content space-y-6">
                {template.fields?.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={getFieldValue(field)}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    patient={patient}
                  />
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>התבנית לא מכילה שדות למילוי</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-800">פעולות מהירות</h3>
            </div>
            <div className="card-content space-y-3">
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={document.status === 'completed'}
                className="btn btn-success w-full flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                סמן כהושלם
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                יצא ל-PDF
              </button>

              <button
                onClick={() => handleExport('docx')}
                className="btn btn-ghost w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                יצא ל-Word
              </button>
            </div>
          </div>

          {/* Document Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-800">פרטי מסמך</h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם המסמך
                </label>
                <input
                  type="text"
                  value={document.name}
                  onChange={(e) => {
                    updateDocument(document.id, { name: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תגיות
                </label>
                <div className="flex flex-wrap gap-2">
                  {document.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>נוצר: {new Date(document.createdAt).toLocaleDateString('he-IL')}</p>
                <p>עודכן: {new Date(document.updatedAt).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};