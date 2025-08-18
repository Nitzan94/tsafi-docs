import type { Patient, GeneratedDocument } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface DocumentValidationResult extends ValidationResult {
  warnings: ValidationWarning[];
}

/**
 * Comprehensive document validation utility for Word export
 */
export class DocumentValidator {
  /**
   * Validate patient data before Word export
   */
  static validatePatientData(patient: Patient): DocumentValidationResult {
    const errors: string[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields validation
    if (!patient.firstName?.trim()) {
      errors.push('שם פרטי חובה');
    }

    if (!patient.lastName?.trim()) {
      errors.push('שם משפחה חובה');
    }

    if (!patient.idNumber?.trim()) {
      errors.push('תעודת זהות חובה');
    } else if (!this.isValidIsraeliId(patient.idNumber)) {
      errors.push('תעודת זהות לא תקינה');
    }

    if (!patient.phone?.trim()) {
      errors.push('מספר טלפון חובה');
    } else if (!this.isValidIsraeliPhone(patient.phone)) {
      warnings.push({
        field: 'phone',
        message: 'פורמט מספר טלפון לא מוכר'
      });
    }

    if (!patient.birthDate) {
      errors.push('תאריך לידה חובה');
    } else {
      const age = this.calculateAge(patient.birthDate);
      if (age < 0) {
        errors.push('תאריך לידה לא יכול להיות בעתיד');
      } else if (age > 120) {
        warnings.push({
          field: 'birthDate',
          message: 'גיל המטופל גבוה מהרגיל'
        });
      }
    }

    // Address validation
    if (!patient.address?.street?.trim()) {
      warnings.push({
        field: 'address.street',
        message: 'כתובת רחוב חסרה'
      });
    }

    if (!patient.address?.city?.trim()) {
      warnings.push({
        field: 'address.city',
        message: 'עיר חסרה'
      });
    }

    // Email validation (if provided)
    if (patient.email && !this.isValidEmail(patient.email)) {
      warnings.push({
        field: 'email',
        message: 'פורמט אימייל לא תקין'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate generated document data before Word export
   */
  static validateDocumentData(document: GeneratedDocument): DocumentValidationResult {
    const errors: string[] = [];
    const warnings: ValidationWarning[] = [];

    if (!document.title?.trim()) {
      errors.push('כותרת המסמך חובה');
    }

    if (!document.content?.trim()) {
      errors.push('תוכן המסמך חובה');
    } else {
      // Check for potentially sensitive information
      const sensitivePatterns = [
        /\d{9}/g, // ID numbers
        /\d{3}-\d{7}/g, // Israeli phone numbers
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g // Email addresses
      ];

      sensitivePatterns.forEach((pattern, index) => {
        const patternNames = ['תעודת זהות', 'מספר טלפון', 'כתובת אימייל'];
        if (pattern.test(document.content)) {
          warnings.push({
            field: 'content',
            message: `יש לוודא שפרטים רגישים (${patternNames[index]}) מוצגים כראוי`
          });
        }
      });
    }

    if (!document.patientId?.trim()) {
      errors.push('זיהוי מטופל חובה');
    }

    if (!document.templateId?.trim()) {
      errors.push('זיהוי תבנית חובה');
    }

    // Field values validation
    if (!document.fieldValues || Object.keys(document.fieldValues).length === 0) {
      warnings.push({
        field: 'fieldValues',
        message: 'לא נמצאו נתוני שדות במסמך'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Israeli ID number using the official algorithm
   */
  private static isValidIsraeliId(id: string): boolean {
    if (!id || !/^\d{9}$/.test(id)) {
      return false;
    }

    const digits = id.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let digit = digits[i] * ((i % 2) + 1);
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
      sum += digit;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate Israeli phone number format
   */
  private static isValidIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[-\s()]/g, '');
    
    // Israeli mobile patterns
    const mobilePatterns = [
      /^05[0-9]{8}$/, // 05X-XXXXXXX
      /^972-5[0-9]{8}$/, // +972-5X-XXXXXXX
      /^\+972-5[0-9]{8}$/ // +972-5X-XXXXXXX
    ];

    // Israeli landline patterns
    const landlinePatterns = [
      /^0[2-4,7-9][0-9]{7}$/, // 0X-XXXXXXX
      /^972-[2-4,7-9][0-9]{7}$/, // +972-X-XXXXXXX
      /^\+972-[2-4,7-9][0-9]{7}$/ // +972-X-XXXXXXX
    ];

    return [...mobilePatterns, ...landlinePatterns].some(pattern => 
      pattern.test(cleanPhone)
    );
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate age from birth date
   */
  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Validate medical history completeness
   */
  static validateMedicalHistory(patient: Patient): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (!patient.medicalHistory || patient.medicalHistory.length === 0) {
      warnings.push({
        field: 'medicalHistory',
        message: 'לא נמצאה היסטוריה רפואית'
      });
      return warnings;
    }

    patient.medicalHistory.forEach((record, index) => {
      if (!record.diagnosis?.trim()) {
        warnings.push({
          field: `medicalHistory[${index}].diagnosis`,
          message: `רישום ${index + 1}: חסרה אבחנה`
        });
      }

      if (!record.treatment?.trim()) {
        warnings.push({
          field: `medicalHistory[${index}].treatment`,
          message: `רישום ${index + 1}: חסר טיפול`
        });
      }

      if (!record.date) {
        warnings.push({
          field: `medicalHistory[${index}].date`,
          message: `רישום ${index + 1}: חסר תאריך`
        });
      }
    });

    return warnings;
  }

  /**
   * Check document export readiness
   */
  static isDocumentReadyForExport(
    patient: Patient,
    document?: GeneratedDocument
  ): { ready: boolean; issues: string[] } {
    const issues: string[] = [];

    const patientValidation = this.validatePatientData(patient);
    issues.push(...patientValidation.errors);

    if (document) {
      const documentValidation = this.validateDocumentData(document);
      issues.push(...documentValidation.errors);
    }

    // Check for critical medical information
    const medicalWarnings = this.validateMedicalHistory(patient);
    const criticalMedicalIssues = medicalWarnings.filter(w => 
      w.message.includes('חסרה אבחנה') || w.message.includes('חסר טיפול')
    );
    
    if (criticalMedicalIssues.length > 0) {
      issues.push('חסרים פרטים רפואיים חיוניים');
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }
}

/**
 * Helper functions for data sanitization before export
 */
export class DataSanitizer {
  /**
   * Sanitize patient data for export (remove sensitive info if needed)
   */
  static sanitizePatientForExport(patient: Patient, options: {
    includeFullId?: boolean;
    includeEmail?: boolean;
    includePhone?: boolean;
  } = {}): Patient {
    const sanitized = { ...patient };

    // Mask ID number if requested
    if (!options.includeFullId && sanitized.idNumber) {
      sanitized.idNumber = sanitized.idNumber.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
    }

    // Remove email if requested
    if (!options.includeEmail) {
      sanitized.email = undefined;
    }

    // Mask phone if requested
    if (!options.includePhone && sanitized.phone) {
      sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    }

    return sanitized;
  }

  /**
   * Clean text content for Word export
   */
  static cleanTextContent(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .replace(/\s{2,}/g, ' ') // Normalize multiple spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
  }

  /**
   * Validate Hebrew text content
   */
  static isHebrewText(text: string): boolean {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text);
  }
}