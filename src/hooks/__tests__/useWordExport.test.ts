import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWordExport, useBatchWordExport } from '../useWordExport';
import type { Patient, GeneratedDocument } from '../../types';

// Mock the WordExport utility
vi.mock('../utils/wordExport', () => ({
  PhysioWordExporter: vi.fn().mockImplementation(() => ({
    exportPatientDocument: vi.fn().mockResolvedValue(undefined),
    exportTreatmentReport: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock DocumentValidator
vi.mock('../utils/documentValidation', () => ({
  DocumentValidator: {
    validatePatientData: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    }),
    validateDocumentData: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    }),
    isDocumentReadyForExport: vi.fn().mockReturnValue({
      ready: true,
      issues: []
    })
  },
  DataSanitizer: {
    sanitizePatientForExport: vi.fn().mockImplementation((patient) => patient)
  }
}));

describe('useWordExport', () => {
  let mockPatient: Patient;
  let mockDocument: GeneratedDocument;

  beforeEach(() => {
    mockPatient = {
      id: 'patient-1',
      firstName: 'יוסי',
      lastName: 'כהן',
      idNumber: '123456789',
      phone: '050-1234567',
      email: 'yossi@example.com',
      birthDate: new Date('1990-05-15'),
      address: {
        street: 'רחוב הרצל 10',
        city: 'תל אביב',
        postalCode: '12345',
        country: 'ישראל'
      },
      medicalHistory: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    };

    mockDocument = {
      id: 'doc-1',
      patientId: 'patient-1',
      templateId: 'template-1',
      title: 'הערכה ראשונית',
      content: 'תוכן המסמך',
      fieldValues: {},
      createdAt: new Date('2024-01-15'),
      lastModified: new Date('2024-01-15'),
      status: 'COMPLETED' as const
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useWordExport - Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useWordExport());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastExportedFile).toBe(null);
      expect(result.current.hasError).toBe(false);
      expect(result.current.isReady).toBe(true);
    });

    it('should provide export functions', () => {
      const { result } = renderHook(() => useWordExport());

      expect(typeof result.current.exportPatient).toBe('function');
      expect(typeof result.current.exportTreatmentReport).toBe('function');
      expect(typeof result.current.canExportPatient).toBe('function');
      expect(typeof result.current.getPatientExportIssues).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.resetState).toBe('function');
    });

    it('should handle export start callback', async () => {
      const onExportStart = vi.fn();
      const { result } = renderHook(() => useWordExport({ onExportStart }));

      await act(async () => {
        await result.current.exportPatient(mockPatient);
      });

      expect(onExportStart).toHaveBeenCalled();
    });

    it('should handle export success callback', async () => {
      const onExportSuccess = vi.fn();
      const { result } = renderHook(() => useWordExport({ onExportSuccess }));

      await act(async () => {
        await result.current.exportPatient(mockPatient);
      });

      expect(onExportSuccess).toHaveBeenCalledWith(
        expect.stringContaining('יוסי-כהן')
      );
    });
  });

  describe('exportPatient', () => {
    it('should export patient successfully', async () => {
      const { result } = renderHook(() => useWordExport());

      await act(async () => {
        await result.current.exportPatient(mockPatient);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastExportedFile).toContain('יוסי-כהן');
    });

    it('should set isExporting to true during export', async () => {
      const { result } = renderHook(() => useWordExport());

      act(() => {
        result.current.exportPatient(mockPatient);
      });

      // Check immediately after starting export
      expect(result.current.isExporting).toBe(true);
    });

    it('should handle export errors', async () => {
      // Mock validation failure
      const { DocumentValidator } = await import('../utils/documentValidation');
      // @ts-ignore
      DocumentValidator.validatePatientData.mockReturnValue({
        isValid: false,
        errors: ['תעודת זהות חובה'],
        warnings: []
      });

      const onExportError = vi.fn();
      const { result } = renderHook(() => useWordExport({ onExportError }));

      await act(async () => {
        try {
          await result.current.exportPatient(mockPatient);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toContain('תעודת זהות חובה');
      expect(onExportError).toHaveBeenCalled();
    });

    it('should prevent concurrent exports', async () => {
      const { result } = renderHook(() => useWordExport());

      // Start first export
      act(() => {
        result.current.exportPatient(mockPatient);
      });

      // Try to start second export while first is running
      await act(async () => {
        await expect(
          result.current.exportPatient(mockPatient)
        ).rejects.toThrow('יצוא כבר מתבצע');
      });
    });

    it('should sanitize patient data when autoSanitize is enabled', async () => {
      const { DataSanitizer } = await import('../utils/documentValidation');
      const { result } = renderHook(() => useWordExport({ autoSanitize: true }));

      await act(async () => {
        await result.current.exportPatient(mockPatient, {
          sanitize: { includeFullId: false }
        });
      });

      expect(DataSanitizer.sanitizePatientForExport).toHaveBeenCalledWith(
        mockPatient,
        { includeFullId: false }
      );
    });

    it('should use default export options', async () => {
      const defaultOptions = {
        physiotherapistName: 'ד"ר שרה לוי',
        licenseNumber: 'PT-12345'
      };

      const { result } = renderHook(() => 
        useWordExport({ defaultExportOptions: defaultOptions })
      );

      const { PhysioWordExporter } = await import('../utils/wordExport');
      const mockExporter = new PhysioWordExporter();

      await act(async () => {
        await result.current.exportPatient(mockPatient);
      });

      expect(mockExporter.exportPatientDocument).toHaveBeenCalledWith(
        mockPatient,
        expect.objectContaining(defaultOptions)
      );
    });
  });

  describe('exportTreatmentReport', () => {
    it('should export treatment report successfully', async () => {
      const { result } = renderHook(() => useWordExport());

      await act(async () => {
        await result.current.exportTreatmentReport(mockPatient, mockDocument);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastExportedFile).toContain('הערכה-ראשונית');
    });

    it('should validate both patient and document data', async () => {
      const { DocumentValidator } = await import('../utils/documentValidation');
      const { result } = renderHook(() => useWordExport());

      await act(async () => {
        await result.current.exportTreatmentReport(mockPatient, mockDocument);
      });

      expect(DocumentValidator.validatePatientData).toHaveBeenCalledWith(mockPatient);
      expect(DocumentValidator.validateDocumentData).toHaveBeenCalledWith(mockDocument);
    });

    it('should handle validation errors for documents', async () => {
      const { DocumentValidator } = await import('../utils/documentValidation');
      // @ts-ignore
      DocumentValidator.validateDocumentData.mockReturnValue({
        isValid: false,
        errors: ['תוכן המסמך חובה'],
        warnings: []
      });

      const { result } = renderHook(() => useWordExport());

      await act(async () => {
        try {
          await result.current.exportTreatmentReport(mockPatient, mockDocument);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toContain('תוכן המסמך חובה');
    });
  });

  describe('Validation Functions', () => {
    it('should check if patient can be exported', () => {
      const { result } = renderHook(() => useWordExport());

      const canExport = result.current.canExportPatient(mockPatient);
      expect(canExport).toBe(true);
    });

    it('should return export issues for patient', () => {
      const { DocumentValidator } = await import('../utils/documentValidation');
      // @ts-ignore
      DocumentValidator.isDocumentReadyForExport.mockReturnValue({
        ready: false,
        issues: ['חסר מספר טלפון']
      });

      const { result } = renderHook(() => useWordExport());

      const issues = result.current.getPatientExportIssues(mockPatient);
      expect(issues).toEqual(['חסר מספר טלפון']);
    });
  });

  describe('State Management', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useWordExport());

      // Set error state
      act(() => {
        // @ts-ignore - accessing private state for testing
        result.current.exportPatient({} as Patient).catch(() => {});
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should reset all state', () => {
      const { result } = renderHook(() => useWordExport());

      act(() => {
        result.current.resetState();
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastExportedFile).toBe(null);
    });
  });

  describe('Options Configuration', () => {
    it('should show validation warnings when configured', async () => {
      const { DocumentValidator } = await import('../utils/documentValidation');
      // @ts-ignore
      DocumentValidator.validatePatientData.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [{ field: 'email', message: 'פורמט אימייל לא תקין' }]
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { result } = renderHook(() => 
        useWordExport({ showValidationWarnings: true })
      );

      await act(async () => {
        await result.current.exportPatient(mockPatient);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'אזהרות באליקציה:',
        expect.arrayContaining([
          expect.objectContaining({ message: 'פורמט אימייל לא תקין' })
        ])
      );

      consoleSpy.mockRestore();
    });

    it('should not auto-sanitize when disabled', async () => {
      const { DataSanitizer } = await import('../utils/documentValidation');
      const { result } = renderHook(() => 
        useWordExport({ autoSanitize: false })
      );

      await act(async () => {
        await result.current.exportPatient(mockPatient, {
          sanitize: { includeFullId: false }
        });
      });

      expect(DataSanitizer.sanitizePatientForExport).not.toHaveBeenCalled();
    });
  });
});

describe('useBatchWordExport', () => {
  let mockPatients: Patient[];

  beforeEach(() => {
    mockPatients = [
      {
        id: 'patient-1',
        firstName: 'יוסי',
        lastName: 'כהן',
        idNumber: '123456789',
        phone: '050-1234567',
        birthDate: new Date('1990-05-15'),
        address: { street: 'רחוב 1', city: 'תל אביב', postalCode: '12345', country: 'ישראל' },
        medicalHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'patient-2',
        firstName: 'שרה',
        lastName: 'לוי',
        idNumber: '987654321',
        phone: '050-7654321',
        birthDate: new Date('1985-03-20'),
        address: { street: 'רחוב 2', city: 'חיפה', postalCode: '54321', country: 'ישראל' },
        medicalHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    vi.clearAllMocks();
  });

  describe('exportMultiplePatients', () => {
    it('should initialize with correct batch state', () => {
      const { result } = renderHook(() => useBatchWordExport());

      expect(result.current.isBatchExporting).toBe(false);
      expect(result.current.batchProgress).toBe(0);
      expect(result.current.batchTotal).toBe(0);
      expect(result.current.batchErrors).toEqual([]);
      expect(result.current.batchCompleted).toEqual([]);
      expect(result.current.batchProgressPercent).toBe(0);
      expect(result.current.hasBatchErrors).toBe(false);
      expect(result.current.isBatchComplete).toBe(false);
    });

    it('should export multiple patients successfully', async () => {
      const { result } = renderHook(() => useBatchWordExport());

      await act(async () => {
        await result.current.exportMultiplePatients(mockPatients);
      });

      expect(result.current.isBatchExporting).toBe(false);
      expect(result.current.batchProgress).toBe(2);
      expect(result.current.batchTotal).toBe(2);
      expect(result.current.batchCompleted).toHaveLength(2);
      expect(result.current.batchErrors).toHaveLength(0);
      expect(result.current.isBatchComplete).toBe(true);
    });

    it('should track progress during batch export', async () => {
      const { result } = renderHook(() => useBatchWordExport());

      act(() => {
        result.current.exportMultiplePatients(mockPatients);
      });

      // Should start with correct total
      expect(result.current.batchTotal).toBe(2);
      expect(result.current.isBatchExporting).toBe(true);
    });

    it('should handle individual patient export failures', async () => {
      // Mock one patient to fail validation
      const { DocumentValidator } = await import('../utils/documentValidation');
      // @ts-ignore
      DocumentValidator.validatePatientData.mockImplementation((patient: Patient) => ({
        isValid: patient.id === 'patient-1',
        errors: patient.id === 'patient-2' ? ['שגיאה באליקציה'] : [],
        warnings: []
      }));

      const { result } = renderHook(() => useBatchWordExport());

      await act(async () => {
        await result.current.exportMultiplePatients(mockPatients);
      });

      expect(result.current.batchCompleted).toHaveLength(1);
      expect(result.current.batchErrors).toHaveLength(1);
      expect(result.current.hasBatchErrors).toBe(true);
    });

    it('should prevent concurrent batch exports', async () => {
      const { result } = renderHook(() => useBatchWordExport());

      // Start first batch export
      act(() => {
        result.current.exportMultiplePatients(mockPatients);
      });

      // Try to start second batch export
      await act(async () => {
        await expect(
          result.current.exportMultiplePatients(mockPatients)
        ).rejects.toThrow('יצוא אצווה כבר מתבצע');
      });
    });

    it('should calculate progress percentage correctly', async () => {
      const { result } = renderHook(() => useBatchWordExport());

      await act(async () => {
        await result.current.exportMultiplePatients(mockPatients);
      });

      expect(result.current.batchProgressPercent).toBe(100);
    });

    it('should handle callbacks for individual exports', async () => {
      const onExportStart = vi.fn();
      const onExportSuccess = vi.fn();
      
      const { result } = renderHook(() => 
        useBatchWordExport({ onExportStart, onExportSuccess })
      );

      await act(async () => {
        await result.current.exportMultiplePatients(mockPatients);
      });

      expect(onExportStart).toHaveBeenCalled();
      expect(onExportSuccess).toHaveBeenCalledTimes(2);
    });

    it('should reset batch state', () => {
      const { result } = renderHook(() => useBatchWordExport());

      act(() => {
        result.current.resetBatchState();
      });

      expect(result.current.isBatchExporting).toBe(false);
      expect(result.current.batchProgress).toBe(0);
      expect(result.current.batchTotal).toBe(0);
      expect(result.current.batchErrors).toEqual([]);
      expect(result.current.batchCompleted).toEqual([]);
    });
  });
});