import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  CheckCircle
} from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { usePatientStore } from '@/store/usePatientStore';
import { DocumentCard } from '@/components/Documents/DocumentCard';
import { DocumentCreationModal } from '@/components/Documents/DocumentCreationModal';
import { DocumentPreviewModal } from '@/components/Documents/DocumentPreviewModal';
import type { Document, DocumentStatus } from '@/types/template';
import { DOCUMENT_STATUS_LABELS, TEMPLATE_CATEGORIES } from '@/types/template';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    searchTerm,
    selectedStatus,
    setSearchTerm,
    setSelectedStatus,
    getFilteredDocuments,
    deleteDocument,
    duplicateDocument,
    updateDocument,
    cleanupCorruptedData,
    error,
    clearError,
    isLoading
  } = useDocumentStore();

  const { templates } = useTemplateStore();
  const { patients } = usePatientStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Initialize and cleanup data on first load
  useEffect(() => {
    cleanupCorruptedData();
  }, [cleanupCorruptedData]);

  const filteredDocuments = useMemo(() => {
    return getFilteredDocuments();
  }, [documents, searchTerm, selectedStatus]);

  const handleNewDocument = () => {
    setShowCreateModal(true);
  };

  const handleDocumentCreated = (documentId: string) => {
    // Navigate directly to the editor with the new document ID
    window.location.href = `/documents/edit/${documentId}`;
  };

  const handleEditDocument = (document: Document) => {
    window.location.href = `/documents/edit/${document.id}`;
  };

  const handleDeleteDocument = async (document: Document) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את המסמך "${document.name}"?`)) {
      await deleteDocument(document.id);
    }
  };

  const handleDuplicateDocument = async (document: Document) => {
    const newName = prompt('הכניסי שם למסמך החדש:', `העתק של ${document.name}`);
    if (newName && newName.trim()) {
      await duplicateDocument(document.id, newName.trim());
    }
  };

  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
  };

  const handleExportDocument = async (document: Document, format: 'pdf' | 'docx') => {
    if (format === 'docx') {
      try {
        const patient = patients.find(p => p.id === document.patientId);
        const template = templates.find(t => t.id === document.templateId);
        
        if (!patient || !template) {
          alert('שגיאה: לא נמצאו נתוני המטופל או התבנית');
          return;
        }

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

  const handleQuickCreate = (templateCategory: string) => {
    const template = templates.find(t => t.category === templateCategory);
    if (template) {
      // Open modal with pre-selected template
      setShowCreateModal(true);
      // TODO: Pass preSelectedTemplate to modal
    }
  };

  // Calculate statistics
  const totalDocuments = documents.length;
  const draftDocuments = documents.filter(d => d.status === 'draft').length;
  const completedDocuments = documents.filter(d => d.status === 'completed').length;
  const thisWeekDocuments = documents.filter(d => {
    const createdDate = typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt;
    return !isNaN(createdDate.getTime()) && 
           createdDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  // Get popular templates for quick actions
  const popularTemplates = templates
    .filter(t => t.isActive)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            ניהול מסמכים
          </h1>
          <p className="text-gray-600 mt-2">
            נהלי את כל המסמכים שיצרת ויצרי מסמכים חדשים מתבניות
          </p>
        </div>
        <button
          onClick={handleNewDocument}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          יצירת מסמך חדש
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">סה״כ מסמכים</p>
              <p className="text-3xl font-bold text-blue-800">{totalDocuments}</p>
              <p className="text-xs text-blue-600 mt-1">במערכת</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <FileText className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">טיוטות</p>
              <p className="text-3xl font-bold text-orange-800">{draftDocuments}</p>
              <p className="text-xs text-orange-600 mt-1">דורשות השלמה</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-xl">
              <Clock className="h-8 w-8 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">הושלמו</p>
              <p className="text-3xl font-bold text-green-800">{completedDocuments}</p>
              <p className="text-xs text-green-600 mt-1">מוכנים לייצוא</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">השבוע</p>
              <p className="text-3xl font-bold text-purple-800">{thisWeekDocuments}</p>
              <p className="text-xs text-purple-600 mt-1">מסמכים חדשים</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {popularTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">יצירה מהירה</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleQuickCreate(template.category)}
                className="card-compact text-right hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800 truncate">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {TEMPLATE_CATEGORIES[template.category]}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {template.usageCount} שימושים
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="חפש מסמך לפי שם, תוכן או תגיות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pr-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus | 'all')}
            className="input min-w-[150px]"
          >
            <option value="all">כל הסטטוסים</option>
            {Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({documents.filter(d => d.status === value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600">טוען מסמכים...</p>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && filteredDocuments.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              מציג {filteredDocuments.length} מתוך {totalDocuments} מסמכים
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
                onDuplicate={handleDuplicateDocument}
                onPreview={handlePreviewDocument}
                onExport={handleExportDocument}
              />
            ))}
          </div>
        </>
      ) : !isLoading ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              {searchTerm ? (
                <Search className="h-12 w-12 text-gray-400" />
              ) : (
                <FileText className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'לא נמצאו מסמכים' : 'אין מסמכים עדיין'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `לא נמצאו תוצאות עבור "${searchTerm}"`
                : 'התחילי ביצירת המסמך הראשון שלך מתבנית מוכנה'
              }
            </p>
            {!searchTerm && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleNewDocument}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  צרי מסמך ראשון
                </button>
                <button
                  onClick={() => window.location.href = '/templates'}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  צפי בתבניות
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Document Creation Modal */}
      <DocumentCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          document={previewDocument}
          template={templates.find(t => t.id === previewDocument.templateId)!}
          patient={patients.find(p => p.id === previewDocument.patientId)!}
          onEdit={handleEditDocument}
          onExport={(format) => handleExportDocument(previewDocument, format)}
          onUpdateDocument={(updates) => updateDocument(previewDocument.id, updates)}
        />
      )}
    </div>
  );
};