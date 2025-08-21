import React, { useState } from 'react';
import { FileText, User, Calendar, MapPin, Phone, Eye, EyeOff } from 'lucide-react';
import type { Patient } from '@/types';
import type { Document, Template, TemplateField } from '@/types/template';
import { formatHebrewDate } from '@/utils/hebrew';

interface DocumentPreviewProps {
  document: Document;
  template: Template;
  patient: Patient;
  onUpdateDocument?: (updates: Partial<Document>) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  template,
  patient,
  onUpdateDocument
}) => {
  const [showPatientDetails, setShowPatientDetails] = useState(
    document.displaySettings?.showPatientDetails ?? true
  );
  const [showContactDetails, setShowContactDetails] = useState(
    document.displaySettings?.showContactDetails ?? true
  );

  const handleTogglePatientDetails = () => {
    const newValue = !showPatientDetails;
    setShowPatientDetails(newValue);
    onUpdateDocument?.({
      displaySettings: {
        ...document.displaySettings,
        showPatientDetails: newValue
      }
    });
  };

  const handleToggleContactDetails = () => {
    const newValue = !showContactDetails;
    setShowContactDetails(newValue);
    onUpdateDocument?.({
      displaySettings: {
        ...document.displaySettings,
        showContactDetails: newValue
      }
    });
  };
  const renderFieldValue = (field: TemplateField, value: any) => {
    if (!value || value === '') {
      return <span className="text-gray-400 italic">לא מולא</span>;
    }

    switch (field.type) {
      case 'date':
        return formatHebrewDate(new Date(value));
      
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      
      case 'patient_info':
        return (
          <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
            {value}
          </span>
        );
      
      case 'signature':
        return (
          <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-lg">
            ✍️ <span>חתום דיגיטלית</span>
          </div>
        );
      
      default:
        return value;
    }
  };

  const getPatientAge = () => {
    if (!patient.birthDate) return 'לא ידוע';
    const dateObj = typeof patient.birthDate === 'string' ? new Date(patient.birthDate) : patient.birthDate;
    if (isNaN(dateObj.getTime())) return 'לא ידוע';
    const age = Math.floor((Date.now() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${age}`;
  };

  return (
    <div className="space-y-6">
      {/* Document Content */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8 bg-white">
          {/* Patient Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">פרטי המטופל</h3>
                  </div>
                  <button
                    onClick={handleTogglePatientDetails}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                    title={showPatientDetails ? "הסתר פרטי מטופל" : "הצג פרטי מטופל"}
                  >
                    {showPatientDetails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {showPatientDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">שם מלא:</span>
                      <span className="text-gray-600">{patient.firstName} {patient.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">תעודת זהות:</span>
                      <span className="text-gray-600">{patient.idNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">גיל:</span>
                      <span className="text-gray-600">{getPatientAge()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">פרטי קשר</h3>
                  </div>
                  <button
                    onClick={handleToggleContactDetails}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                    title={showContactDetails ? "הסתר פרטי קשר" : "הצג פרטי קשר"}
                  >
                    {showContactDetails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {showContactDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{patient.email}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">
                          {patient.address.street}, {patient.address.city}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">תבנית:</span>
                <span className="text-gray-600">{template.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">תאריך יצירה:</span>
                <span className="text-gray-600">{formatHebrewDate(document.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">עדכון אחרון:</span>
                <span className="text-gray-600">{formatHebrewDate(document.updatedAt)}</span>
              </div>
            </div>
          </div>


          {/* Form Fields - Word Document Style */}
          {template.fields && template.fields.length > 0 && (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-sm">
              <div className="space-y-6">
                {template.fields
                  .filter((field) => {
                    const value = document.data?.[field.name];
                    return value && value !== '' && value !== null && value !== undefined && 
                           (typeof value !== 'string' || value.trim() !== '');
                  })
                  .map((field) => {
                  const value = document.data?.[field.name];
                  return (
                    <div 
                      key={field.name}
                      className="flex items-baseline gap-4 py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-32">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}:
                        </label>
                      </div>
                      <div className="flex-1 min-h-[24px] border-b border-dotted border-gray-400 pb-1">
                        <div 
                          className="text-sm text-gray-800"
                          style={{ 
                            fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                            minHeight: '20px'
                          }}
                        >
                          {renderFieldValue(field, value)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                <p>מסמך נוצר במערכת ניהול המסמכים</p>
                <p>© {new Date().getFullYear()} - כל הזכויות שמורות</p>
              </div>
              <div className="text-left">
                <p>מזהה מסמך: {document.id.slice(-8)}</p>
                <p>גרסה: 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};