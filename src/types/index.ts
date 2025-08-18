// Patient Management Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email?: string;
  birthDate: Date;
  address: Address;
  medicalHistory: MedicalRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface MedicalRecord {
  id: string;
  date: Date;
  diagnosis: string;
  treatment: string;
  notes?: string;
  attachments?: string[];
}

// Document Template Types
export interface DocumentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  fields: TemplateField[];
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TemplateCategory {
  ASSESSMENT = 'assessment',
  TREATMENT_PLAN = 'treatment-plan',
  PROGRESS_NOTE = 'progress-note',
  DISCHARGE_SUMMARY = 'discharge-summary',
  INSURANCE_REPORT = 'insurance-report'
}

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: ValidationRule[];
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  DATE = 'date',
  NUMBER = 'number',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio'
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: string | number;
  message: string;
}

// Generated Document Types
export interface GeneratedDocument {
  id: string;
  patientId: string;
  templateId: string;
  title: string;
  content: string;
  fieldValues: Record<string, any>;
  createdAt: Date;
  lastModified: Date;
  status: DocumentStatus;
}

export enum DocumentStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  EXPORTED = 'exported'
}

// Application State Types
export interface AppSettings {
  language: 'he' | 'en';
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  backupEnabled: boolean;
  defaultTemplateCategory: TemplateCategory;
}

// UI Component Types
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  validation?: ValidationRule[];
}