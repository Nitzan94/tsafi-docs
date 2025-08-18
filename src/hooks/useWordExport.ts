import { useCallback, useState, useMemo } from 'react';
import { PhysioWordExporter, type WordExportOptions } from '../utils/wordExport';
import { DocumentValidator, DataSanitizer } from '../utils/documentValidation';
import type { Patient, GeneratedDocument } from '../types';

interface ExportState {
  isExporting: boolean;
  error: string | null;
  lastExportedFile: string | null;
}

interface UseWordExportOptions {
  /**
   * Show validation warnings to user before export
   */
  showValidationWarnings?: boolean;
  
  /**
   * Auto-sanitize sensitive data before export
   */
  autoSanitize?: boolean;
  
  /**
   * Default export options
   */
  defaultExportOptions?: Partial<WordExportOptions>;
  
  /**
   * Callback fired when export starts
   */
  onExportStart?: () => void;
  
  /**
   * Callback fired when export completes successfully
   */
  onExportSuccess?: (fileName: string) => void;
  
  /**
   * Callback fired when export fails
   */
  onExportError?: (error: Error) => void;
}

interface ExportPatientOptions extends WordExportOptions {
  /**
   * Include medical history in the export
   */
  includeMedicalHistory?: boolean;
  
  /**
   * Include signature section
   */
  includeSignature?: boolean;
  
  /**
   * Sanitization options
   */
  sanitize?: {
    includeFullId?: boolean;
    includeEmail?: boolean;
    includePhone?: boolean;
  };
}

/**
 * React hook for Word document export functionality
 */
export const useWordExport = (options: UseWordExportOptions = {}) => {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
    lastExportedFile: null
  });

  const exporter = useMemo(() => new PhysioWordExporter(), []);

  const {
    showValidationWarnings = true,
    autoSanitize = true,
    defaultExportOptions = {},
    onExportStart,
    onExportSuccess,
    onExportError
  } = options;

  /**
   * Export patient data to Word document
   */
  const exportPatient = useCallback(async (
    patient: Patient,
    exportOptions: ExportPatientOptions = {}
  ): Promise<void> => {
    if (state.isExporting) {
      throw new Error('יצוא כבר מתבצע');
    }

    try {
      setState(prev => ({ ...prev, isExporting: true, error: null }));
      onExportStart?.();

      // Validate patient data
      const validation = DocumentValidator.validatePatientData(patient);
      
      if (!validation.isValid) {
        throw new Error(`שגיאות באליקציה: ${validation.errors.join(', ')}`);
      }

      // Show warnings if configured
      if (showValidationWarnings && validation.warnings.length > 0) {
        console.warn('אזהרות באליקציה:', validation.warnings);
      }

      // Prepare patient data for export
      let patientToExport = patient;
      if (autoSanitize && exportOptions.sanitize) {
        patientToExport = DataSanitizer.sanitizePatientForExport(
          patient,
          exportOptions.sanitize
        );
      }

      // Prepare export options
      const finalOptions: WordExportOptions = {
        ...defaultExportOptions,
        ...exportOptions,
        includeMedicalHistory: exportOptions.includeMedicalHistory ?? true,
        includeSignatureSection: exportOptions.includeSignature ?? true
      };

      // Perform export
      await exporter.exportPatientDocument(patientToExport, finalOptions);

      const fileName = `${patient.firstName}-${patient.lastName}-${new Date().toISOString().split('T')[0]}.docx`;
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false, 
        lastExportedFile: fileName 
      }));
      
      onExportSuccess?.(fileName);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה ביצוא';
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false, 
        error: errorMessage 
      }));
      
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [
    state.isExporting,
    exporter,
    showValidationWarnings,
    autoSanitize,
    defaultExportOptions,
    onExportStart,
    onExportSuccess,
    onExportError
  ]);

  /**
   * Export treatment report to Word document
   */
  const exportTreatmentReport = useCallback(async (
    patient: Patient,
    document: GeneratedDocument,
    exportOptions: WordExportOptions = {}
  ): Promise<void> => {
    if (state.isExporting) {
      throw new Error('יצוא כבר מתבצע');
    }

    try {
      setState(prev => ({ ...prev, isExporting: true, error: null }));
      onExportStart?.();

      // Validate data
      const patientValidation = DocumentValidator.validatePatientData(patient);
      const documentValidation = DocumentValidator.validateDocumentData(document);

      if (!patientValidation.isValid || !documentValidation.isValid) {
        const allErrors = [
          ...patientValidation.errors,
          ...documentValidation.errors
        ];
        throw new Error(`שגיאות באליקציה: ${allErrors.join(', ')}`);
      }

      // Prepare export options
      const finalOptions: WordExportOptions = {
        ...defaultExportOptions,
        ...exportOptions
      };

      // Perform export
      await exporter.exportTreatmentReport(patient, document, finalOptions);

      const fileName = `${patient.firstName}-${patient.lastName}-${document.title}-${new Date().toISOString().split('T')[0]}.docx`;
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false, 
        lastExportedFile: fileName 
      }));
      
      onExportSuccess?.(fileName);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה ביצוא';
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false, 
        error: errorMessage 
      }));
      
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [
    state.isExporting,
    exporter,
    defaultExportOptions,
    onExportStart,
    onExportSuccess,
    onExportError
  ]);

  /**
   * Check if patient data is ready for export
   */
  const canExportPatient = useCallback((patient: Patient): boolean => {
    const readiness = DocumentValidator.isDocumentReadyForExport(patient);
    return readiness.ready;
  }, []);

  /**
   * Get validation issues for patient export
   */
  const getPatientExportIssues = useCallback((patient: Patient): string[] => {
    const readiness = DocumentValidator.isDocumentReadyForExport(patient);
    return readiness.issues;
  }, []);

  /**
   * Clear export error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset export state
   */
  const resetState = useCallback(() => {
    setState({
      isExporting: false,
      error: null,
      lastExportedFile: null
    });
  }, []);

  return {
    // Export functions
    exportPatient,
    exportTreatmentReport,
    
    // Validation functions
    canExportPatient,
    getPatientExportIssues,
    
    // State management
    clearError,
    resetState,
    
    // State
    isExporting: state.isExporting,
    error: state.error,
    lastExportedFile: state.lastExportedFile,
    
    // Computed state
    hasError: !!state.error,
    isReady: !state.isExporting && !state.error
  };
};

/**
 * Hook for batch Word export operations
 */
export const useBatchWordExport = (options: UseWordExportOptions = {}) => {
  const [batchState, setBatchState] = useState<{
    isExporting: boolean;
    progress: number;
    total: number;
    errors: string[];
    completed: string[];
  }>({
    isExporting: false,
    progress: 0,
    total: 0,
    errors: [],
    completed: []
  });

  const exporter = new PhysioWordExporter();
  const { onExportStart, onExportSuccess, onExportError } = options;

  /**
   * Export multiple patients to Word documents
   */
  const exportMultiplePatients = useCallback(async (
    patients: Patient[],
    exportOptions: ExportPatientOptions = {}
  ): Promise<void> => {
    if (batchState.isExporting) {
      throw new Error('יצוא אצווה כבר מתבצע');
    }

    setBatchState({
      isExporting: true,
      progress: 0,
      total: patients.length,
      errors: [],
      completed: []
    });

    onExportStart?.();

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      try {
        // Validate patient
        const validation = DocumentValidator.validatePatientData(patient);
        if (!validation.isValid) {
          throw new Error(`${patient.firstName} ${patient.lastName}: ${validation.errors.join(', ')}`);
        }

        // Export patient
        await exporter.exportPatientDocument(patient, {
          ...exportOptions,
          includeMedicalHistory: exportOptions.includeMedicalHistory ?? true,
          includeSignatureSection: exportOptions.includeSignature ?? true
        });

        const fileName = `${patient.firstName}-${patient.lastName}-${new Date().toISOString().split('T')[0]}.docx`;
        
        setBatchState(prev => ({
          ...prev,
          progress: i + 1,
          completed: [...prev.completed, fileName]
        }));

        onExportSuccess?.(fileName);

        // Small delay to prevent browser freezing
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
        
        setBatchState(prev => ({
          ...prev,
          progress: i + 1,
          errors: [...prev.errors, errorMessage]
        }));

        onExportError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    }

    setBatchState(prev => ({ ...prev, isExporting: false }));
  }, [batchState.isExporting, exporter, onExportStart, onExportSuccess, onExportError]);

  /**
   * Reset batch export state
   */
  const resetBatchState = useCallback(() => {
    setBatchState({
      isExporting: false,
      progress: 0,
      total: 0,
      errors: [],
      completed: []
    });
  }, []);

  return {
    exportMultiplePatients,
    resetBatchState,
    
    // Batch state
    isBatchExporting: batchState.isExporting,
    batchProgress: batchState.progress,
    batchTotal: batchState.total,
    batchErrors: batchState.errors,
    batchCompleted: batchState.completed,
    
    // Computed batch state
    batchProgressPercent: batchState.total > 0 ? (batchState.progress / batchState.total) * 100 : 0,
    hasBatchErrors: batchState.errors.length > 0,
    isBatchComplete: batchState.progress === batchState.total && batchState.total > 0
  };
};