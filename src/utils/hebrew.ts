/**
 * Hebrew language utilities for RTL support and localization
 */

import { format as dateFnsFormat } from 'date-fns';
import { he } from 'date-fns/locale';

/**
 * Format date in Hebrew locale
 * @param date - Date to format
 * @param formatStr - Format string
 * @returns Formatted date string in Hebrew
 */
export function formatHebrewDate(date: Date | string | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) {
    return 'לא זמין';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'תאריך לא תקין';
  }
  
  return dateFnsFormat(dateObj, formatStr, { locale: he });
}

/**
 * Format phone number for Israeli format
 * @param phone - Phone number string
 * @returns Formatted phone number (05X-XXXXXXX)
 */
export function formatIsraeliPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return phone;
}

/**
 * Validate Israeli ID number (תעודת זהות)
 * @param id - ID number string
 * @returns true if valid Israeli ID
 */
export function validateIsraeliId(id: string): boolean {
  const cleaned = id.replace(/\D/g, '');
  
  if (cleaned.length !== 9) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Hebrew text direction utilities
 */
export const RTL_LANGUAGES = ['he', 'ar', 'fa'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * Hebrew number formatting
 * @param num - Number to format
 * @returns Hebrew formatted number
 */
export function formatHebrewNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num);
}

/**
 * Common Hebrew medical terms
 */
export const MEDICAL_TERMS_HE = {
  diagnosis: 'אבחנה',
  treatment: 'טיפול',
  assessment: 'הערכה',
  progressNote: 'הערת התקדמות',
  treatmentPlan: 'תוכנית טיפול',
  dischargeSummary: 'סיכום שחרור',
  insuranceReport: 'דוח ביטוח',
  patient: 'מטופל',
  therapist: 'מטפל',
  session: 'פגישה',
  pain: 'כאב',
  mobility: 'ניידות',
  strength: 'כוח',
  range: 'טווח תנועה',
} as const;

/**
 * Template category translations
 */
export const TEMPLATE_CATEGORIES_HE = {
  assessment: 'הערכה ראשונית',
  'treatment-plan': 'תוכנית טיפול',
  'progress-note': 'הערת התקדמות',
  'discharge-summary': 'סיכום שחרור',
  'insurance-report': 'דוח ביטוח',
} as const;