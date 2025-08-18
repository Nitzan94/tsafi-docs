import React, { useState } from 'react';
import { X, Download, Edit3, Printer } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { WordDocumentExporter } from '@/utils/documentExportSimple';
import type { Document, Template } from '@/types/template';
import type { Patient } from '@/types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  template: Template;
  patient: Patient;
  onEdit?: (document: Document) => void;
  onExport?: (format: 'pdf' | 'docx') => void;
  onUpdateDocument?: (updates: Partial<Document>) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  template,
  patient,
  onEdit,
  onExport,
  onUpdateDocument
}) => {
  
  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit?.(document);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWordExport = async () => {
    console.log('Word export clicked!', { document, template, patient });
    try {
      const exporter = new WordDocumentExporter({
        document,
        template,
        patient
      });
      console.log('Exporter created, calling exportToWord...');
      await exporter.exportToWord();
      console.log('Word export completed successfully!');
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert(`שגיאה ביצוא קובץ Word: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    }
  };

  const handlePDFExport = () => {
    // TODO: implement PDF export
    if (onExport) {
      onExport('pdf');
    } else {
      alert('יצוא PDF יתווסף בקרוב!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl mx-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">תצוגה מקדימה</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-xs sm:max-w-none">{document.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            
            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              title="הדפס תצוגה מקדימה"
            >
              <Printer className="h-4 w-4" />
            </button>
            
            <>
              <button
                onClick={handlePDFExport}
                className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleWordExport}
                className="px-2 sm:px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                title="יצוא לפורמט Word"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Word</span>
              </button>
            </>
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                ערוך
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="p-6">
            <DocumentPreview
              document={document}
              template={template}
              patient={patient}
              onExport={onExport}
              onUpdateDocument={onUpdateDocument}
            />
          </div>
        </div>
      </div>
    </div>
  );
};