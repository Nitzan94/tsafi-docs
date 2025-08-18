import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  Layout,
  ArrowLeft,
  Search,
  Plus,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePatientStore } from '@/store/usePatientStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import type { Patient } from '@/types';
import type { Template, TemplateCategory } from '@/types/template';
import { TEMPLATE_CATEGORIES } from '@/types/template';

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated?: (documentId: string) => void;
  preSelectedPatient?: Patient;
  preSelectedTemplate?: Template;
}

type Step = 'patient' | 'template' | 'confirm';

export const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
  preSelectedPatient,
  preSelectedTemplate
}) => {
  const { patients } = usePatientStore();
  const { templates } = useTemplateStore();
  const { addDocument } = useDocumentStore();

  const [currentStep, setCurrentStep] = useState<Step>(
    preSelectedPatient ? (preSelectedTemplate ? 'confirm' : 'template') : 'patient'
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(preSelectedPatient || null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(preSelectedTemplate || null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    if (!patientSearchTerm) return true;
    const term = patientSearchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(term) ||
      patient.lastName.toLowerCase().includes(term) ||
      patient.idNumber.includes(term)
    );
  });

  // Filter templates based on category
  const filteredTemplates = templates.filter(template => {
    if (!template.isActive) return false;
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  }).sort((a, b) => b.usageCount - a.usageCount);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep('template');
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep('confirm');
  };

  const handleCreateDocument = async () => {
    if (!selectedPatient || !selectedTemplate) return;

    setIsCreating(true);
    try {
      const documentName = `${selectedTemplate.name} - ${selectedPatient.firstName} ${selectedPatient.lastName}`;
      
      // Auto-fill patient_info fields
      const autoFilledData: Record<string, any> = {};
      
      selectedTemplate.fields?.forEach(field => {
        if (field.type === 'patient_info' && field.patientField) {
          if (field.patientField === 'full_name') {
            autoFilledData[field.name] = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
          } else if (field.patientField === 'age') {
            const birthDate = typeof selectedPatient.birthDate === 'string' 
              ? new Date(selectedPatient.birthDate) 
              : selectedPatient.birthDate;
            if (birthDate && !isNaN(birthDate.getTime())) {
              const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
              autoFilledData[field.name] = `${age}`;
            }
          } else if (field.patientField === 'address') {
            if (selectedPatient.address) {
              autoFilledData[field.name] = `${selectedPatient.address.street}, ${selectedPatient.address.city}`;
            }
          } else if (selectedPatient[field.patientField as keyof typeof selectedPatient]) {
            autoFilledData[field.name] = selectedPatient[field.patientField as keyof typeof selectedPatient];
          }
        }
      });
      
      const newDocument = {
        name: documentName,
        templateId: selectedTemplate.id,
        patientId: selectedPatient.id,
        data: autoFilledData,
        content: selectedTemplate.content || '',
        status: 'draft' as const,
        tags: [selectedTemplate.category, 'חדש'],
      };

      const createdDocumentId = await addDocument(newDocument);
      
      // Increment template usage
      const { updateTemplate } = useTemplateStore.getState();
      await updateTemplate(selectedTemplate.id, {
        usageCount: selectedTemplate.usageCount + 1
      });

      // Pass the created document ID directly
      onDocumentCreated?.(createdDocumentId);
      onClose();
      resetModal();
    } catch (error) {
      console.error('שגיאה ביצירת המסמך:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(preSelectedPatient ? (preSelectedTemplate ? 'confirm' : 'template') : 'patient');
    setSelectedPatient(preSelectedPatient || null);
    setSelectedTemplate(preSelectedTemplate || null);
    setPatientSearchTerm('');
    setSelectedCategory('all');
    setIsCreating(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300); // Wait for modal animation
  };

  const goBack = () => {
    if (currentStep === 'template') {
      setCurrentStep('patient');
      setSelectedTemplate(null);
    } else if (currentStep === 'confirm') {
      setCurrentStep('template');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">יצירת מסמך חדש</h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'patient' && 'בחרי מטופל'}
                {currentStep === 'template' && 'בחרי תבנית מסמך'}
                {currentStep === 'confirm' && 'אישור פרטי המסמך'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse">
            <div className={cn(
              "flex items-center gap-2",
              currentStep === 'patient' ? 'text-blue-600' : 
              selectedPatient ? 'text-green-600' : 'text-gray-400'
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                currentStep === 'patient' ? 'bg-blue-100 text-blue-600' :
                selectedPatient ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              )}>
                {selectedPatient ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium">בחירת מטופל</span>
            </div>

            <ArrowLeft className="h-4 w-4 text-gray-400" />

            <div className={cn(
              "flex items-center gap-2",
              currentStep === 'template' ? 'text-blue-600' :
              selectedTemplate ? 'text-green-600' : 'text-gray-400'
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                currentStep === 'template' ? 'bg-blue-100 text-blue-600' :
                selectedTemplate ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              )}>
                {selectedTemplate ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="font-medium">בחירת תבנית</span>
            </div>

            <ArrowLeft className="h-4 w-4 text-gray-400" />

            <div className={cn(
              "flex items-center gap-2",
              currentStep === 'confirm' ? 'text-blue-600' : 'text-gray-400'
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                currentStep === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              )}>
                3
              </div>
              <span className="font-medium">אישור ויצירה</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Patient Selection */}
          {currentStep === 'patient' && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="חפש מטופל לפי שם או תעודת זהות..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="input w-full pr-10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="card-compact text-right hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          ת.ז. {patient.idNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.medicalHistory?.length || 0} טיפולים קודמים
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">לא נמצאו מטופלים</p>
                  <button className="btn btn-ghost mt-4 flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    הוסף מטופל חדש
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 'template' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סנן לפי קטגוריה
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
                  className="input w-full max-w-xs"
                >
                  <option value="all">כל הקטגוריות</option>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="card-compact text-right hover:bg-green-50 hover:border-green-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Layout className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 group-hover:text-green-800">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {TEMPLATE_CATEGORIES[template.category]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {template.usageCount} שימושים • {template.fields?.length || 0} שדות
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <Layout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">לא נמצאו תבניות</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 'confirm' && selectedPatient && selectedTemplate && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">פרטי המסמך החדש</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      מטופל
                    </h4>
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-sm text-gray-600">ת.ז. {selectedPatient.idNumber}</p>
                      <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      תבנית
                    </h4>
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="font-semibold">{selectedTemplate.name}</p>
                      <p className="text-sm text-gray-600">{TEMPLATE_CATEGORIES[selectedTemplate.category]}</p>
                      <p className="text-sm text-gray-600">{selectedTemplate.fields?.length || 0} שדות למילוי</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">שם המסמך:</p>
                  <p className="font-semibold">
                    {selectedTemplate.name} - {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>שימו לב:</strong> המסמך ייווצר כטיוטה. תוכלי להמשיך למלא את השדות ולערוך אותו לפני השלמה סופית.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex gap-3">
            {currentStep !== 'patient' && (
              <button
                onClick={goBack}
                className="btn btn-ghost"
                disabled={isCreating}
              >
                חזור
              </button>
            )}
            <button
              onClick={handleClose}
              className="btn btn-ghost"
              disabled={isCreating}
            >
              ביטול
            </button>
          </div>

          <div>
            {currentStep === 'confirm' && (
              <button
                onClick={handleCreateDocument}
                disabled={isCreating}
                className="btn btn-primary flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    יוצר מסמך...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    צור מסמך
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};