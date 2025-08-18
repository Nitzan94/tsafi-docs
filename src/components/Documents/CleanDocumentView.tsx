import React from 'react';
import type { Patient } from '@/types';
import type { Document, Template, TemplateField } from '@/types/template';
import { formatHebrewDate } from '@/utils/hebrew';

interface CleanDocumentViewProps {
  document: Document;
  template: Template;
  patient: Patient;
}

export const CleanDocumentView: React.FC<CleanDocumentViewProps> = ({
  document,
  template,
  patient
}) => {
  const renderFieldValue = (field: TemplateField, value: any) => {
    if (!value || value === '') {
      return '_____________________________';
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
        return value;
      
      case 'signature':
        return 'חתום דיגיטלית ✍️';
      
      default:
        return value;
    }
  };

  const processTemplateContent = (content: string) => {
    let processedContent = content;
    
    // Replace patient info placeholders
    processedContent = processedContent.replace(/{{patientName}}/g, `${patient.firstName} ${patient.lastName}`);
    
    // Replace field placeholders with actual values
    if (template.fields && document.data) {
      template.fields.forEach(field => {
        const placeholder = `{{${field.name}}}`;
        const value = document.data[field.name];
        const processedValue = value ? renderFieldValue(field, value) : '_____________________________';
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), processedValue);
      });
    }
    
    // Remove any remaining placeholders that weren't matched
    processedContent = processedContent.replace(/{{[^}]+}}/g, '_____________________________');
    
    return processedContent;
  };

  const getPatientAge = () => {
    if (!patient.birthDate) return 'לא ידוע';
    const dateObj = typeof patient.birthDate === 'string' ? new Date(patient.birthDate) : patient.birthDate;
    if (isNaN(dateObj.getTime())) return 'לא ידוע';
    const age = Math.floor((Date.now() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${age} שנים`;
  };

  return (
    <div 
      id="clean-document-content"
      className="bg-white text-black min-h-screen"
      style={{
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '2cm',
        margin: '0',
        direction: 'rtl'
      }}
    >
      {/* Document Title */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          {document.name}
        </h1>
        <h2 style={{ fontSize: '18px', fontWeight: 'normal', margin: '0', color: '#666' }}>
          {template.name}
        </h2>
      </div>

      {/* Patient Information Header */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
          פרטי המטופל
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>שם מלא:</strong> {patient.firstName} {patient.lastName}
          </div>
          <div>
            <strong>תעודת זהות:</strong> {patient.idNumber}
          </div>
          <div>
            <strong>גיל:</strong> {getPatientAge()}
          </div>
          <div>
            <strong>טלפון:</strong> {patient.phone}
          </div>
          {patient.email && (
            <div>
              <strong>אימייל:</strong> {patient.email}
            </div>
          )}
          {patient.address && (
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>כתובת:</strong> {patient.address.street}, {patient.address.city}
            </div>
          )}
        </div>
      </div>

      {/* Document Metadata */}
      <div style={{ marginBottom: '30px', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <strong>תאריך יצירה:</strong> {formatHebrewDate(document.createdAt)}
          </div>
          <div>
            <strong>עדכון אחרון:</strong> {formatHebrewDate(document.updatedAt)}
          </div>
          <div>
            <strong>גרסה:</strong> {document.version}
          </div>
        </div>
      </div>

      {/* Processed Template Content */}
      {template.content && (
        <div style={{ marginBottom: '30px' }}>
          <div 
            style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8'
            }}
          >
            {processTemplateContent(template.content)}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div style={{ 
        marginTop: '50px', 
        paddingTop: '30px', 
        borderTop: '1px solid #ccc',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '50px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', height: '40px' }}></div>
          <div style={{ fontSize: '12px' }}>חתימת המטפל</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', height: '40px' }}></div>
          <div style={{ fontSize: '12px' }}>תאריך</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '50px', 
        paddingTop: '20px', 
        borderTop: '1px solid #ccc',
        fontSize: '10px',
        color: '#666',
        textAlign: 'center'
      }}>
        <div>מסמך נוצר במערכת ניהול המסמכים • מזהה: {document.id.slice(-8)} • {formatHebrewDate(new Date())}</div>
      </div>
    </div>
  );
};