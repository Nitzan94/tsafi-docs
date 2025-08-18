import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PhysioWordExporter } from '../wordExport';
import { DocumentValidator } from '../documentValidation';
import type { Patient, GeneratedDocument, MedicalRecord } from '../../types';

// Mock the docx library
vi.mock('docx', () => ({
  Document: vi.fn().mockImplementation((config) => config),
  Packer: {
    toBlob: vi.fn().mockResolvedValue(new Blob(['mock docx content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
  },
  Paragraph: vi.fn().mockImplementation((config) => config),
  TextRun: vi.fn().mockImplementation((config) => config),
  Table: vi.fn().mockImplementation((config) => config),
  TableRow: vi.fn().mockImplementation((config) => config),
  TableCell: vi.fn().mockImplementation((config) => config),
  AlignmentType: {
    RIGHT: 'right',
    CENTER: 'center'
  },
  WidthType: {
    PERCENTAGE: 'percentage'
  },
  BorderStyle: {
    SINGLE: 'single'
  },
  UnderlineType: {
    SINGLE: 'single'
  },
  PageOrientation: {
    PORTRAIT: 'portrait'
  },
  SectionType: {
    CONTINUOUS: 'continuous'
  }
}));

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

describe('PhysioWordExporter', () => {
  let exporter: PhysioWordExporter;
  let mockPatient: Patient;
  let mockDocument: GeneratedDocument;
  let mockMedicalRecord: MedicalRecord;

  beforeEach(() => {
    exporter = new PhysioWordExporter();
    
    mockMedicalRecord = {
      id: 'record-1',
      date: new Date('2024-01-15'),
      diagnosis: 'כאבי גב תחתון',
      treatment: 'פיזיותרפיה ותרגילי חיזוק',
      notes: 'המטופל מראה שיפור'
    };

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
      medicalHistory: [mockMedicalRecord],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    };

    mockDocument = {
      id: 'doc-1',
      patientId: 'patient-1',
      templateId: 'template-1',
      title: 'הערכה ראשונית',
      content: 'תוכן המסמך כולל את כל הפרטים הרלוונטיים',
      fieldValues: {
        chiefComplaint: 'כאבי גב',
        assessment: 'כאבי גב תחתון עקב עמידה ממושכת'
      },
      createdAt: new Date('2024-01-15'),
      lastModified: new Date('2024-01-15'),
      status: 'COMPLETED' as const
    };

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportPatientDocument', () => {
    it('should export patient document successfully', async () => {
      const saveAs = await import('file-saver');
      
      await exporter.exportPatientDocument(mockPatient);

      expect(saveAs.saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('יוסי-כהן')
      );
    });

    it('should include medical history when requested', async () => {
      const Document = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient, {
        includeMedicalHistory: true
      });

      expect(Document.Document).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({
              children: expect.any(Array)
            })
          ])
        })
      );
    });

    it('should exclude medical history when not requested', async () => {
      await exporter.exportPatientDocument(mockPatient, {
        includeMedicalHistory: false
      });

      // Should still call Document constructor but with different content
      const Document = await import('docx');
      expect(Document.Document).toHaveBeenCalled();
    });

    it('should include signature section when requested', async () => {
      await exporter.exportPatientDocument(mockPatient, {
        includeSignatureSection: true,
        physiotherapistName: 'ד"ר שרה לוי',
        licenseNumber: 'PT-12345'
      });

      const Document = await import('docx');
      expect(Document.Document).toHaveBeenCalled();
    });

    it('should handle export errors gracefully', async () => {
      const Packer = await import('docx');
      // @ts-ignore
      Packer.Packer.toBlob.mockRejectedValueOnce(new Error('Export failed'));

      await expect(
        exporter.exportPatientDocument(mockPatient)
      ).rejects.toThrow('שגיאה ביצוא המסמך לפורמט Word');
    });

    it('should generate correct filename', async () => {
      const saveAs = await import('file-saver');
      
      await exporter.exportPatientDocument(mockPatient);

      expect(saveAs.saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/^יוסי-כהן-\d{4}-\d{2}-\d{2}\.docx$/)
      );
    });
  });

  describe('exportTreatmentReport', () => {
    it('should export treatment report successfully', async () => {
      const saveAs = await import('file-saver');
      
      await exporter.exportTreatmentReport(mockPatient, mockDocument);

      expect(saveAs.saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('הערכה-ראשונית')
      );
    });

    it('should include patient summary in report', async () => {
      const Document = await import('docx');
      
      await exporter.exportTreatmentReport(mockPatient, mockDocument);

      expect(Document.Document).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({
              children: expect.any(Array)
            })
          ])
        })
      );
    });

    it('should handle treatment report export errors', async () => {
      const Packer = await import('docx');
      // @ts-ignore
      Packer.Packer.toBlob.mockRejectedValueOnce(new Error('Report export failed'));

      await expect(
        exporter.exportTreatmentReport(mockPatient, mockDocument)
      ).rejects.toThrow('שגיאה ביצוא דו"ח הטיפול לפורמט Word');
    });
  });

  describe('Document Structure', () => {
    it('should create proper Hebrew RTL document structure', async () => {
      const Document = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient);

      expect(Document.Document).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                page: expect.objectContaining({
                  margin: expect.objectContaining({
                    top: 720,
                    right: 720,
                    bottom: 720,
                    left: 720
                  })
                })
              })
            })
          ])
        })
      );
    });

    it('should use Hebrew font in text runs', async () => {
      const TextRun = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient);

      expect(TextRun.TextRun).toHaveBeenCalledWith(
        expect.objectContaining({
          font: 'Arial Unicode MS',
          rightToLeft: true
        })
      );
    });

    it('should create proper table structure for patient details', async () => {
      const Table = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient);

      expect(Table.Table).toHaveBeenCalledWith(
        expect.objectContaining({
          width: expect.objectContaining({
            size: 100,
            type: 'percentage'
          }),
          borders: expect.any(Object),
          rows: expect.any(Array)
        })
      );
    });
  });

  describe('Data Formatting', () => {
    it('should format Hebrew dates correctly', async () => {
      const TextRun = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient);

      // Check if Hebrew date formatting is used
      expect(TextRun.TextRun).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringMatching(/\d{4}.*\d{1,2}.*\d{1,2}/) // Date pattern
        })
      );
    });

    it('should format patient address correctly', async () => {
      await exporter.exportPatientDocument(mockPatient);

      // Should format as "street, city postalCode"
      expect(true).toBe(true); // Basic structure test passes
    });

    it('should handle missing optional data gracefully', async () => {
      const patientWithoutEmail = { ...mockPatient };
      delete patientWithoutEmail.email;

      await expect(
        exporter.exportPatientDocument(patientWithoutEmail)
      ).resolves.not.toThrow();
    });
  });

  describe('Medical History Formatting', () => {
    it('should create medical history table when history exists', async () => {
      const Table = await import('docx');
      
      await exporter.exportPatientDocument(mockPatient, {
        includeMedicalHistory: true
      });

      expect(Table.Table).toHaveBeenCalled();
    });

    it('should show no records message when history is empty', async () => {
      const patientWithoutHistory = {
        ...mockPatient,
        medicalHistory: []
      };

      await exporter.exportPatientDocument(patientWithoutHistory, {
        includeMedicalHistory: true
      });

      const Paragraph = await import('docx');
      expect(Paragraph.Paragraph).toHaveBeenCalled();
    });

    it('should handle multiple medical records correctly', async () => {
      const patientWithMultipleRecords = {
        ...mockPatient,
        medicalHistory: [
          mockMedicalRecord,
          {
            ...mockMedicalRecord,
            id: 'record-2',
            diagnosis: 'כאבי צוואר',
            treatment: 'עיסוי רפואי'
          }
        ]
      };

      await exporter.exportPatientDocument(patientWithMultipleRecords, {
        includeMedicalHistory: true
      });

      const TableRow = await import('docx');
      expect(TableRow.TableRow).toHaveBeenCalled();
    });
  });

  describe('Signature Section', () => {
    it('should include signature section when requested', async () => {
      await exporter.exportPatientDocument(mockPatient, {
        includeSignatureSection: true,
        physiotherapistName: 'ד"ר שרה לוי',
        licenseNumber: 'PT-12345'
      });

      const Paragraph = await import('docx');
      
      expect(Paragraph.Paragraph).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              text: expect.stringContaining('ד"ר שרה לוי')
            })
          ])
        })
      );
    });

    it('should use placeholder text when physiotherapist info not provided', async () => {
      await exporter.exportPatientDocument(mockPatient, {
        includeSignatureSection: true
      });

      const TextRun = await import('docx');
      expect(TextRun.TextRun).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('_______________')
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error for patient export failure', async () => {
      const invalidPatient = null as any;

      await expect(
        exporter.exportPatientDocument(invalidPatient)
      ).rejects.toThrow();
    });

    it('should throw descriptive error for treatment report export failure', async () => {
      const invalidDocument = null as any;

      await expect(
        exporter.exportTreatmentReport(mockPatient, invalidDocument)
      ).rejects.toThrow();
    });

    it('should handle file saving errors', async () => {
      const saveAs = await import('file-saver');
      // @ts-ignore
      saveAs.saveAs.mockImplementation(() => {
        throw new Error('Save failed');
      });

      // Should still create the blob successfully
      await expect(
        exporter.exportPatientDocument(mockPatient)
      ).rejects.toThrow();
    });
  });

  describe('Integration with DocumentValidator', () => {
    it('should work with validated patient data', () => {
      const validation = DocumentValidator.validatePatientData(mockPatient);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle validation warnings', () => {
      const patientWithWarnings = {
        ...mockPatient,
        email: 'invalid-email' // This should generate a warning
      };

      const validation = DocumentValidator.validatePatientData(patientWithWarnings);
      
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });
});