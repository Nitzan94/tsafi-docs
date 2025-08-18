// Template system types for Tzafi's physiotherapy practice

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  fields: TemplateField[];
  content: string; // תוכן התבנית עם placeholders
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  authorName?: string; // שם היוצר
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  description?: string;
  options?: FieldOption[]; // for select/radio fields
  validation?: FieldValidation;
  order: number;
  group?: string; // קיבוץ שדות
  defaultValue?: any;
  dependsOn?: string; // שדה תלוי
  showWhen?: string; // תנאי הצגה
  patientField?: string; // for patient_info type
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  customMessage?: string;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'patient-select' // בחירת מטופל
  | 'signature' // חתימה דיגיטלית
  | 'patient_info' // מידע אוטומטי מהמטופל
  | 'rating' // דירוג (1-10)
  | 'pain-scale' // סולם כאב
  | 'body-diagram' // תרשים גוף
  | 'file-upload' // העלאת קבצים
  | 'divider' // מפריד
  | 'header'; // כותרת

export type TemplateCategory = 
  | 'assessment' // הערכה ראשונית
  | 'treatment' // דוח טיפול
  | 'progress' // דוח התקדמות
  | 'discharge' // דוח שחרור
  | 'exercise' // תוכנית תרגילים
  | 'referral' // הפניה
  | 'certificate' // אישור רפואי
  | 'invoice' // חשבונית
  | 'insurance' // דוח לביטוח
  | 'custom'; // תבנית מותאמת אישית

// Document system types
export interface Document {
  id: string;
  name: string;
  templateId: string;
  patientId: string;
  data: Record<string, any>; // נתוני הטופס
  content: string; // תוכן מעובד של המסמך
  status: DocumentStatus;
  version: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  exportedAt?: Date;
  exportFormat?: ExportFormat[];
  signedBy?: string; // חתם על ידי
  signedAt?: Date;
  displaySettings?: {
    showPatientDetails?: boolean;
    showContactDetails?: boolean;
  };
}

export type DocumentStatus = 'draft' | 'completed' | 'signed' | 'exported' | 'archived';
export type ExportFormat = 'pdf' | 'docx' | 'html' | 'print';

// Document status labels in Hebrew
export const DOCUMENT_STATUS_LABELS = {
  draft: 'טיוטה',
  completed: 'הושלם',
  signed: 'נחתם',
  exported: 'יוצא',
  archived: 'בארכיון'
} as const;

// Export format labels in Hebrew
export const EXPORT_FORMAT_LABELS = {
  pdf: 'PDF',
  docx: 'Word',
  html: 'HTML',
  print: 'הדפסה'
} as const;

// Template categories with Hebrew labels
export const TEMPLATE_CATEGORIES = {
  assessment: 'הערכה ראשונית',
  treatment: 'דוח טיפול',
  progress: 'דוח התקדמות',
  discharge: 'דוח שחרור',
  exercise: 'תוכנית תרגילים',
  referral: 'הפניה רפואית',
  certificate: 'אישור רפואי',
  invoice: 'חשבונית',
  insurance: 'דוח לביטוח',
  custom: 'תבנית מותאמת'
} as const;

// Field type labels in Hebrew
export const FIELD_TYPE_LABELS = {
  text: 'טקסט',
  textarea: 'טקסט רב-שורתי',
  number: 'מספר',
  date: 'תאריך',
  time: 'שעה',
  datetime: 'תאריך ושעה',
  select: 'רשימה נפתחת',
  radio: 'בחירה יחידה',
  checkbox: 'תיבת סימון',
  'patient-select': 'בחירת מטופל',
  patient_info: 'מידע המטופל',
  signature: 'חתימה',
  rating: 'דירוג',
  'pain-scale': 'סולם כאב',
  'body-diagram': 'תרשים גוף',
  'file-upload': 'העלאת קבצים',
  divider: 'מפריד',
  header: 'כותרת'
} as const;

// Common physiotherapy template configurations
export const DEFAULT_TEMPLATES: Partial<Template>[] = [
  {
    name: 'הערכה ראשונית',
    description: 'טופס הערכה ראשונית למטופלים חדשים',
    category: 'assessment',
    content: `הערכה פיזיותרפית ראשונית

שם המטופל: {{patientName}}
מקור הפניה: {{referralSource}}

תלונה עיקרית:
{{mainComplaint}}

רמת כאב נוכחית: {{painLevel}}/10

בדיקה פיזיקלית:
- טווח תנועה: נבדק ותועד
- כוח שריר: נבדק ותועד  
- יציבה: נבדקה ותועדה

תוכנית טיפול:
1. לטיפול המשך לפי המלצות
2. תרגילים בבית
3. מעקב קבוע

חתימת המטפל: ___________________`,
    fields: [
      {
        id: '1',
        name: 'patientName',
        label: 'שם המטופל',
        type: 'patient_info',
        patientField: 'full_name',
        required: true,
        order: 1
      },
      {
        id: '2',
        name: 'referralSource',
        label: 'מקור הפניה',
        type: 'select',
        required: true,
        options: [
          { value: 'family_doctor', label: 'רופא משפחה' },
          { value: 'specialist', label: 'רופא מומחה' },
          { value: 'hospital', label: 'בית חולים' },
          { value: 'self_referral', label: 'פניה עצמית' },
          { value: 'other', label: 'אחר' }
        ],
        order: 2
      },
      {
        id: '3',
        name: 'mainComplaint',
        label: 'תלונה עיקרית',
        type: 'textarea',
        required: true,
        placeholder: 'תאר את הסיבה העיקרית לפנייה...',
        order: 3
      },
      {
        id: '4',
        name: 'painLevel',
        label: 'רמת כאב נוכחית',
        type: 'pain-scale',
        required: true,
        order: 4
      }
    ]
  },
  {
    name: 'דוח טיפול',
    description: 'תיעוד טיפול יומי',
    category: 'treatment',
    content: `דוח טיפול פיזיותרפי

שם המטופל: {{patientName}}
תאריך הטיפול: {{treatmentDate}}

מטרות הטיפול:
{{treatmentGoals}}

טיפולים שבוצעו:
{{interventions}}

תגובת המטופל:
{{response}}

הוראות להמשך:
{{nextSteps}}

שם המטפל: ___________________
חתימה: ___________________`,
    fields: [
      {
        id: '1',
        name: 'patientName',
        label: 'שם המטופל',
        type: 'patient_info',
        patientField: 'full_name',
        required: true,
        order: 1
      },
      {
        id: '2',
        name: 'treatmentDate',
        label: 'תאריך הטיפול',
        type: 'date',
        required: true,
        order: 2
      },
      {
        id: '3',
        name: 'treatmentGoals',
        label: 'מטרות הטיפול',
        type: 'textarea',
        required: true,
        order: 3
      },
      {
        id: '4',
        name: 'interventions',
        label: 'התערבויות שבוצעו',
        type: 'textarea',
        required: true,
        order: 4
      },
      {
        id: '5',
        name: 'response',
        label: 'תגובת המטופל',
        type: 'textarea',
        required: false,
        order: 5
      },
      {
        id: '6',
        name: 'nextSteps',
        label: 'הוראות להמשך',
        type: 'textarea',
        required: false,
        order: 6
      }
    ]
  }
];