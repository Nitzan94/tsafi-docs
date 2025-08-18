import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient } from '@/types';

interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

interface PatientActions {
  // Patient CRUD operations
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  
  // UI state management
  setCurrentPatient: (patient: Patient | null) => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  
  // Computed getters
  getFilteredPatients: () => Patient[];
  getTotalPatients: () => number;
  getActivePatients: () => Patient[];
  
  // Utility functions
  cleanupCorruptedData: () => void;
  initializeDefaultPatients: () => Promise<void>;
}

export const usePatientStore = create<PatientState & PatientActions>()(
  persist(
    (set, get) => ({
      // Initial State
      patients: [],
      currentPatient: null,
      searchTerm: '',
      isLoading: false,
      error: null,

      // Actions
      addPatient: async (patientData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newPatient: Patient = {
            ...patientData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            patients: [...state.patients, newPatient],
            isLoading: false,
          }));
          
          console.log('מטופל חדש נוסף:', newPatient.firstName, newPatient.lastName);
        } catch (error) {
          set({ 
            error: 'שגיאה בהוספת המטופל. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      updatePatient: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          set((state) => ({
            patients: state.patients.map((patient) =>
              patient.id === id
                ? { ...patient, ...updates, updatedAt: new Date() }
                : patient
            ),
            currentPatient:
              state.currentPatient?.id === id
                ? { ...state.currentPatient, ...updates, updatedAt: new Date() }
                : state.currentPatient,
            isLoading: false,
          }));
          
          console.log('פרטי המטופל עודכנו בהצלחה');
        } catch (error) {
          set({ 
            error: 'שגיאה בעדכון פרטי המטופל. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      deletePatient: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const patient = get().patients.find(p => p.id === id);
          if (!patient) {
            throw new Error('מטופל לא נמצא');
          }
          
          set((state) => ({
            patients: state.patients.filter((patient) => patient.id !== id),
            currentPatient:
              state.currentPatient?.id === id ? null : state.currentPatient,
            isLoading: false,
          }));
          
          console.log('המטופל נמחק מהמערכת:', patient.firstName, patient.lastName);
        } catch (error) {
          set({ 
            error: 'שגיאה במחיקת המטופל. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      getPatient: (id) => {
        return get().patients.find(patient => patient.id === id);
      },

      setCurrentPatient: (patient) => {
        set({ currentPatient: patient });
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },

      clearError: () => {
        set({ error: null });
      },

      // Computed getters
      getFilteredPatients: () => {
        const { patients, searchTerm } = get();
        if (!searchTerm) return patients;
        
        const term = searchTerm.toLowerCase();
        return patients.filter(patient => 
          patient.firstName.toLowerCase().includes(term) ||
          patient.lastName.toLowerCase().includes(term) ||
          patient.idNumber.includes(term) ||
          patient.phone.includes(term)
        );
      },

      getTotalPatients: () => {
        return get().patients.length;
      },

      getActivePatients: () => {
        // For now, all patients are considered active
        // Later we can add an 'isActive' field or filter by recent treatments
        return get().patients;
      },

      // Utility function to clean up corrupted data
      cleanupCorruptedData: () => {
        try {
          const { patients } = get();
          const cleanedPatients = patients.filter(patient => {
            // Check if patient has valid dates
            return patient.createdAt && 
                   patient.updatedAt && 
                   patient.birthDate &&
                   !isNaN(new Date(patient.createdAt).getTime()) &&
                   !isNaN(new Date(patient.updatedAt).getTime()) &&
                   !isNaN(new Date(patient.birthDate).getTime());
          }).map(patient => ({
            ...patient,
            createdAt: new Date(patient.createdAt),
            updatedAt: new Date(patient.updatedAt),
            birthDate: new Date(patient.birthDate),
            medicalHistory: patient.medicalHistory?.map(record => ({
              ...record,
              date: new Date(record.date)
            })) || []
          }));

          set({ patients: cleanedPatients });
          console.log('נתוני מטופלים מקולקלים נוקו בהצלחה');
        } catch (error) {
          console.error('שגיאה בניקוי נתוני מטופלים:', error);
          // If cleanup fails, clear all data
          set({ patients: [] });
        }
      },

      initializeDefaultPatients: async () => {
        const { patients, addPatient } = get();
        
        // Only initialize if no patients exist
        if (patients.length > 0) {
          return;
        }

        try {
          set({ isLoading: true });
          
          const defaultPatients = [
            {
              firstName: 'שרה',
              lastName: 'כהן',
              idNumber: '123456789',
              phone: '050-1234567',
              email: 'sarah.cohen@email.com',
              birthDate: new Date('1985-05-15'),
              address: {
                street: 'רחוב הרצל 123',
                city: 'תל אביב',
                postalCode: '6423806',
                country: 'ישראל'
              },
              medicalHistory: [
                {
                  id: '1',
                  date: new Date('2024-01-15'),
                  diagnosis: 'כאבי גב תחתון',
                  treatment: 'פיזיותרפיה וחיזוק שרירים',
                  notes: 'שיפור ניכר לאחר שבועיים'
                }
              ]
            },
            {
              firstName: 'דוד',
              lastName: 'לוי',
              idNumber: '987654321',
              phone: '052-9876543',
              email: 'david.levi@email.com',
              birthDate: new Date('1978-11-22'),
              address: {
                street: 'שדרות רוטשילד 45',
                city: 'תל אביב',
                postalCode: '6511304',
                country: 'ישראל'
              },
              medicalHistory: []
            },
            {
              firstName: 'מירם',
              lastName: 'אברהם',
              idNumber: '456789123',
              phone: '054-4567891',
              email: 'miriam.abraham@email.com',
              birthDate: new Date('1992-03-08'),
              address: {
                street: 'רחוב דיזנגוף 67',
                city: 'תל אביב',
                postalCode: '6433516',
                country: 'ישראל'
              },
              medicalHistory: [
                {
                  id: '1',
                  date: new Date('2024-02-10'),
                  diagnosis: 'פציעת ברך',
                  treatment: 'שיקום לאחר ניתוח',
                  notes: 'התאוששות מצוינת'
                },
                {
                  id: '2',
                  date: new Date('2024-02-20'),
                  diagnosis: 'המשך שיקום',
                  treatment: 'חיזוק ושיפור טווח תנועה',
                  notes: 'חזרה לפעילות ספורטיבית'
                }
              ]
            }
          ];
          
          for (const patientData of defaultPatients) {
            await addPatient(patientData);
          }
          
          console.log('מטופלי ברירת מחדל נוספו בהצלחה');
        } catch (error) {
          console.error('שגיאה באתחול מטופלי ברירת מחדל:', error);
          set({ error: 'שגיאה באתחול מטופלי ברירת מחדל' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'patient-storage',
      partialize: (state) => ({
        patients: state.patients,
        // Don't persist UI state like currentPatient, searchTerm, etc.
      }),
    }
  )
);