import React from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Edit,
  Trash2,
  Mail,
  MapPin,
  Download 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatHebrewDate, formatIsraeliPhone } from '@/utils/hebrew';
import type { Patient } from '@/types';
import { useWordExport } from '@/hooks/useWordExport';

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onViewDocuments?: (patient: Patient) => void;
  onExportToWord?: (patient: Patient) => void;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onViewDocuments,
  onExportToWord,
  className
}) => {
  const { exportPatient, isExporting } = useWordExport({
    onExportSuccess: (fileName) => {
      console.log(`מסמך יוצא בהצלחה: ${fileName}`);
    },
    onExportError: (error) => {
      console.error('שגיאה ביצוא מסמך:', error);
    }
  });

  const handleExportToWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await exportPatient(patient, {
        includeMedicalHistory: true,
        includeSignature: true
      });
      onExportToWord?.(patient);
    } catch (error) {
      console.error('שגיאה ביצוא לWord:', error);
    }
  };
  const calculateAge = (birthDate: Date | string | undefined): number => {
    if (!birthDate) return 0;
    const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (isNaN(dateObj.getTime())) return 0;
    return Math.floor((Date.now() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const checkRecentTreatment = (treatmentDate: Date | string | undefined): boolean => {
    if (!treatmentDate) return false;
    const dateObj = typeof treatmentDate === 'string' ? new Date(treatmentDate) : treatmentDate;
    if (isNaN(dateObj.getTime())) return false;
    return (Date.now() - dateObj.getTime()) < (7 * 24 * 60 * 60 * 1000);
  };
  
  const age = calculateAge(patient.birthDate);
  const documentCount = patient.medicalHistory?.length || 0;
  const lastTreatment = patient.medicalHistory?.[0]?.date;

  return (
    <div className={cn(
      "card-compact group cursor-pointer",
      "transition-all duration-200",
      "hover:shadow-lg hover:scale-105",
      className
    )}>
      {/* Patient Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              גיל {age} • ת.ז. {patient.idNumber}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportToWord}
            disabled={isExporting}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="יצוא לWord"
          >
            <Download className={cn("h-4 w-4", isExporting && "animate-pulse")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(patient);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="עריכת פרטים"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(patient);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="מחיקת מטופל"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4 text-green-600" />
          <span dir="ltr">{formatIsraeliPhone(patient.phone)}</span>
        </div>
        
        {patient.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-purple-600" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="truncate">
            {patient.address.city}, {patient.address.street}
          </span>
        </div>
      </div>

      {/* Treatment Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">מסמכי טיפול</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {documentCount}
          </span>
        </div>

        {lastTreatment && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">טיפול אחרון</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatHebrewDate(lastTreatment, 'dd/MM/yyyy')}
            </span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            lastTreatment && checkRecentTreatment(lastTreatment)
              ? "bg-green-500"
              : "bg-gray-400"
          )}></div>
          <span className="text-xs text-gray-500">
            {lastTreatment && checkRecentTreatment(lastTreatment)
              ? "טיפול השבוע"
              : "לא טופל השבוע"
            }
          </span>
        </div>

        {/* View Documents Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDocuments?.(patient);
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          הצג מסמכים →
        </button>
      </div>
    </div>
  );
};