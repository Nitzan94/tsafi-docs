import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentStatus } from '@/types/template';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  searchTerm: string;
  selectedStatus: DocumentStatus | 'all';
  isLoading: boolean;
  error: string | null;
}

interface DocumentActions {
  // Document CRUD operations
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string, newName?: string) => Promise<void>;
  getDocument: (id: string) => Document | undefined;
  
  // Document status management
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<void>;
  signDocument: (id: string, signedBy: string) => Promise<void>;
  
  // UI state management
  setCurrentDocument: (document: Document | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedStatus: (status: DocumentStatus | 'all') => void;
  clearError: () => void;
  
  // Computed getters
  getFilteredDocuments: () => Document[];
  getDocumentsByPatient: (patientId: string) => Document[];
  getDocumentsByTemplate: (templateId: string) => Document[];
  getTotalDocuments: () => number;
  getDocumentsByStatus: (status: DocumentStatus) => Document[];
  getRecentDocuments: (limit?: number) => Document[];
  
  // Utility functions
  cleanupCorruptedData: () => void;
}

export const useDocumentStore = create<DocumentState & DocumentActions>()(
  persist(
    (set, get) => ({
      // Initial State
      documents: [],
      currentDocument: null,
      searchTerm: '',
      selectedStatus: 'all',
      isLoading: false,
      error: null,

      // Actions
      addDocument: async (documentData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newDocument: Document = {
            ...documentData,
            id: crypto.randomUUID(),
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            documents: [...state.documents, newDocument],
            isLoading: false,
          }));
          
          return newDocument.id;
          
          console.log('מסמך חדש נוצר:', newDocument.name);
        } catch (error) {
          set({ 
            error: 'שגיאה ביצירת המסמך. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      updateDocument: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          set((state) => ({
            documents: state.documents.map((document) =>
              document.id === id
                ? { 
                    ...document, 
                    ...updates, 
                    updatedAt: new Date(),
                    version: document.version + 1
                  }
                : document
            ),
            currentDocument:
              state.currentDocument?.id === id
                ? { 
                    ...state.currentDocument, 
                    ...updates, 
                    updatedAt: new Date(),
                    version: state.currentDocument.version + 1
                  }
                : state.currentDocument,
            isLoading: false,
          }));
          
          console.log('המסמך עודכן בהצלחה');
        } catch (error) {
          set({ 
            error: 'שגיאה בעדכון המסמך. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      deleteDocument: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const document = get().documents.find(d => d.id === id);
          if (!document) {
            throw new Error('מסמך לא נמצא');
          }
          
          set((state) => ({
            documents: state.documents.filter((document) => document.id !== id),
            currentDocument:
              state.currentDocument?.id === id ? null : state.currentDocument,
            isLoading: false,
          }));
          
          console.log('המסמך נמחק מהמערכת:', document.name);
        } catch (error) {
          set({ 
            error: 'שגיאה במחיקת המסמך. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      duplicateDocument: async (documentId, newName) => {
        try {
          const original = get().getDocument(documentId);
          if (!original) {
            throw new Error('מסמך לא נמצא');
          }

          const duplicate = {
            ...original,
            name: newName || `העתק של ${original.name}`,
            status: 'draft' as DocumentStatus,
            completedAt: undefined,
            exportedAt: undefined,
            signedBy: undefined,
            signedAt: undefined,
          };

          // Remove id, createdAt, updatedAt, version to let addDocument handle them
          const { id, createdAt, updatedAt, version, ...documentData } = duplicate;
          
          await get().addDocument(documentData);
        } catch (error) {
          set({ error: 'שגיאה בשכפול המסמך. אנא נסי שוב.' });
        }
      },

      getDocument: (id) => {
        return get().documents.find(document => document.id === id);
      },

      updateDocumentStatus: async (id, status) => {
        const updates: Partial<Document> = { status };
        
        if (status === 'completed') {
          updates.completedAt = new Date();
        } else if (status === 'exported') {
          updates.exportedAt = new Date();
        }
        
        await get().updateDocument(id, updates);
      },

      signDocument: async (id, signedBy) => {
        await get().updateDocument(id, {
          status: 'signed',
          signedBy,
          signedAt: new Date(),
        });
      },

      setCurrentDocument: (document) => {
        set({ currentDocument: document });
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },

      setSelectedStatus: (status) => {
        set({ selectedStatus: status });
      },

      clearError: () => {
        set({ error: null });
      },

      // Computed getters
      getFilteredDocuments: () => {
        const { documents, searchTerm, selectedStatus } = get();
        let result = documents;
        
        // Filter by status
        if (selectedStatus !== 'all') {
          result = result.filter(document => document.status === selectedStatus);
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          result = result.filter(document => 
            document.name.toLowerCase().includes(term) ||
            document.content.toLowerCase().includes(term) ||
            (document.tags && document.tags.some(tag => tag.toLowerCase().includes(term)))
          );
        }
        
        // Sort by updatedAt descending
        return result.sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateB - dateA;
        });
      },

      getDocumentsByPatient: (patientId) => {
        return get().documents.filter(document => document.patientId === patientId);
      },

      getDocumentsByTemplate: (templateId) => {
        return get().documents.filter(document => document.templateId === templateId);
      },

      getTotalDocuments: () => {
        return get().documents.length;
      },

      getDocumentsByStatus: (status) => {
        return get().documents.filter(document => document.status === status);
      },

      getRecentDocuments: (limit = 5) => {
        return get().documents
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA;
          })
          .slice(0, limit);
      },

      // Utility function to clean up corrupted data
      cleanupCorruptedData: () => {
        try {
          const { documents } = get();
          const cleanedDocuments = documents.filter(document => {
            // Check if document has valid dates
            return document.createdAt && 
                   document.updatedAt && 
                   !isNaN(new Date(document.createdAt).getTime()) &&
                   !isNaN(new Date(document.updatedAt).getTime());
          }).map(document => ({
            ...document,
            createdAt: new Date(document.createdAt),
            updatedAt: new Date(document.updatedAt),
            completedAt: document.completedAt ? new Date(document.completedAt) : undefined,
            exportedAt: document.exportedAt ? new Date(document.exportedAt) : undefined,
            signedAt: document.signedAt ? new Date(document.signedAt) : undefined,
          }));

          set({ documents: cleanedDocuments });
          console.log('נתוני מסמכים מקולקלים נוקו בהצלחה');
        } catch (error) {
          console.error('שגיאה בניקוי נתוני מסמכים:', error);
          // If cleanup fails, clear all data
          set({ documents: [] });
        }
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
        // Don't persist UI state like currentDocument, searchTerm, etc.
      }),
    }
  )
);