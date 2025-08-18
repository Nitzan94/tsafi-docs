import React, { useState, useMemo } from 'react';
import { Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWordExport } from '@/hooks/useWordExport';
import { PhysioWordExporter } from '@/utils/wordExport';
import type { Patient, GeneratedDocument, DocumentTemplate } from '@/types';

interface WordExportButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  showToast?: boolean;
}

interface PatientExportButtonProps extends WordExportButtonProps {
  type: 'patient';
  patient: Patient;
  options?: {
    includeMedicalHistory?: boolean;
    includeSignature?: boolean;
    physiotherapistName?: string;
    licenseNumber?: string;
  };
}

interface DocumentExportButtonProps extends WordExportButtonProps {
  type: 'document';
  patient: Patient;
  document: GeneratedDocument;
  options?: {
    includeSignature?: boolean;
    physiotherapistName?: string;
    licenseNumber?: string;
  };
}

interface TemplateExportButtonProps extends WordExportButtonProps {
  type: 'template';
  template: DocumentTemplate;
  sampleData?: Record<string, any>;
  options?: {
    includeSignature?: boolean;
    physiotherapistName?: string;
    licenseNumber?: string;
  };
}

type WordExportButtonAllProps = 
  | PatientExportButtonProps 
  | DocumentExportButtonProps 
  | TemplateExportButtonProps;

/**
 * Toast notification component for export feedback
 */
interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg",
      "animate-in slide-in-from-top-2 duration-300",
      colors[type]
    )}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 ml-2"
        >
          <span className="sr-only">סגור</span>
          ×
        </button>
      </div>
    </div>
  );
};

/**
 * Reusable Word export button component
 */
export const WordExportButton: React.FC<WordExportButtonAllProps> = (props) => {
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const {
    variant = 'primary',
    size = 'md',
    className,
    disabled = false,
    showLabel = true,
    showToast = true
  } = props;

  const { exportPatient, exportTreatmentReport, isExporting, error } = useWordExport({
    onExportSuccess: (fileName) => {
      if (showToast) {
        setToast({
          type: 'success',
          message: `המסמך יוצא בהצלחה: ${fileName}`
        });
      }
    },
    onExportError: (error) => {
      if (showToast) {
        setToast({
          type: 'error',
          message: `שגיאה ביצוא: ${error.message}`
        });
      }
    }
  });

  const handleExport = async () => {
    if (isExporting || disabled) return;

    try {
      switch (props.type) {
        case 'patient':
          await exportPatient(props.patient, {
            includeMedicalHistory: props.options?.includeMedicalHistory ?? true,
            includeSignatureSection: props.options?.includeSignature ?? true,
            physiotherapistName: props.options?.physiotherapistName,
            licenseNumber: props.options?.licenseNumber
          });
          break;

        case 'document':
          await exportTreatmentReport(props.patient, props.document, {
            includeSignatureSection: props.options?.includeSignature ?? true,
            physiotherapistName: props.options?.physiotherapistName,
            licenseNumber: props.options?.licenseNumber
          });
          break;

        case 'template':
          // For template export, we'll create a sample document
          if (showToast) {
            setToast({
              type: 'warning',
              message: 'יצוא תבניות יישמר בגרסה עתידית'
            });
          }
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      // Error handling is done in the hook's onExportError callback
    }
  };

  const getButtonText = () => {
    if (isExporting) return 'מייצא...';
    
    switch (props.type) {
      case 'patient':
        return 'יצוא פרטי מטופל';
      case 'document':
        return 'יצוא מסמך';
      case 'template':
        return 'יצוא תבנית';
      default:
        return 'יצוא לWord';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        title={getButtonText()}
      >
        {isExporting ? (
          <Loader2 className={cn(iconSize[size], 'animate-spin')} />
        ) : (
          <Download className={iconSize[size]} />
        )}
        {showLabel && (
          <span className="whitespace-nowrap">
            {getButtonText()}
          </span>
        )}
      </button>

      {/* Toast notifications */}
      {toast && showToast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Error display for non-toast mode */}
      {error && !showToast && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </>
  );
};

/**
 * Specialized export buttons for common use cases
 */

// Patient export button
export const PatientWordExportButton: React.FC<Omit<PatientExportButtonProps, 'type'>> = (props) => (
  <WordExportButton {...props} type="patient" />
);

// Document export button
export const DocumentWordExportButton: React.FC<Omit<DocumentExportButtonProps, 'type'>> = (props) => (
  <WordExportButton {...props} type="document" />
);

// Template export button
export const TemplateWordExportButton: React.FC<Omit<TemplateExportButtonProps, 'type'>> = (props) => (
  <WordExportButton {...props} type="template" />
);

/**
 * Batch export button for multiple items
 */
interface BatchExportButtonProps {
  patients: Patient[];
  onComplete?: (results: { completed: string[]; errors: string[] }) => void;
  className?: string;
  disabled?: boolean;
}

export const BatchWordExportButton: React.FC<BatchExportButtonProps> = ({
  patients,
  onComplete,
  className,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const exporter = useMemo(() => new PhysioWordExporter(), []);

  const handleBatchExport = async () => {
    if (isExporting || disabled || patients.length === 0) return;

    setIsExporting(true);
    setProgress(0);

    const results = { completed: [] as string[], errors: [] as string[] };

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];

      try {
        // Export patient using direct exporter instance
        await exporter.exportPatientDocument(patient);
        
        results.completed.push(`${patient.firstName} ${patient.lastName}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
        results.errors.push(`${patient.firstName} ${patient.lastName}: ${errorMessage}`);
      }

      setProgress(((i + 1) / patients.length) * 100);

      // Small delay to prevent browser freezing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsExporting(false);
    setProgress(0);
    onComplete?.(results);
  };

  return (
    <button
      onClick={handleBatchExport}
      disabled={disabled || isExporting || patients.length === 0}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
        'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        className
      )}
      title={`יצוא ${patients.length} מטופלים`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>מייצא... ({Math.round(progress)}%)</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>יצוא כולם ({patients.length})</span>
        </>
      )}
    </button>
  );
};