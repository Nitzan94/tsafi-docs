import React from 'react';
import { Calendar, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Patient } from '@/types';
import type { TemplateField } from '@/types/template';

interface FieldRendererProps {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
  patient?: Patient;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  patient
}) => {
  const isRequired = field.validation?.required || false;
  const hasError = isRequired && (!value || value === '');

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "input w-full",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={cn(
              "input w-full resize-y min-h-[100px]",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step || 1}
            className={cn(
              "input w-full",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "input w-full pr-10",
                hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "input w-full",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          >
            <option value="">בחר אפשרות...</option>
            {field.options?.map((option, index) => {
              // Support both old string format and new FieldOption format
              if (typeof option === 'string') {
                return (
                  <option key={`${field.name}-${index}`} value={option}>
                    {option}
                  </option>
                );
              }
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              // Support both old string format and new FieldOption format
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const optionKey = typeof option === 'string' ? `${field.name}-${index}` : option.value;
              
              return (
                <label
                  key={optionKey}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              // Support both old string format and new FieldOption format
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const optionKey = typeof option === 'string' ? `${field.name}-${index}` : option.value;
              
              const isChecked = Array.isArray(value) && value.includes(optionValue);
              return (
                <label
                  key={optionKey}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...currentValue, optionValue]);
                      } else {
                        onChange(currentValue.filter(v => v !== optionValue));
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                ✍️
              </div>
              <p className="text-lg font-medium mb-2">חתימה דיגיטלית</p>
              <p className="text-sm">לחץ כדי להוסיף חתימה</p>
              {value && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">חתימה נשמרה בהצלחה</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'patient_info':
        if (!patient) {
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">מידע המטופל לא זמין</p>
            </div>
          );
        }

        const patientInfo = field.patientField === 'full_name' 
          ? `${patient.firstName} ${patient.lastName}`
          : field.patientField === 'age'
          ? calculateAge(patient.birthDate)
          : field.patientField === 'address'
          ? `${patient.address?.street}, ${patient.address?.city}`
          : patient[field.patientField as keyof Patient] as string;

        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">{patientInfo}</p>
            <p className="text-xs text-blue-600 mt-1">מידע מתעודכן אוטומטית מפרטי המטופל</p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "input w-full",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
        );
    }
  };

  const calculateAge = (birthDate: Date | string | undefined): string => {
    if (!birthDate) return 'לא ידוע';
    const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (isNaN(dateObj.getTime())) return 'לא ידוע';
    const age = Math.floor((Date.now() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${age}`;
  };

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {isRequired && <span className="text-red-500 mr-1">*</span>}
      </label>

      {/* Field Description */}
      {field.description && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">{field.description}</p>
        </div>
      )}

      {/* Field Input */}
      <div>
        {renderField()}
      </div>

      {/* Field Validation */}
      {hasError && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">שדה זה הוא חובה</span>
        </div>
      )}

      {/* Field Helper Text */}
      {field.validation?.maxLength && field.type === 'textarea' && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>מקסימום {field.validation.maxLength} תווים</span>
          <span>{(value || '').length}/{field.validation.maxLength}</span>
        </div>
      )}

      {field.validation?.pattern && (
        <p className="text-xs text-gray-500">
          פורמט נדרש: {field.validation.pattern}
        </p>
      )}
    </div>
  );
};