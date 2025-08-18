import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Template, TemplateCategory } from '@/types/template';

interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  searchTerm: string;
  selectedCategory: TemplateCategory | 'all';
  isLoading: boolean;
  error: string | null;
}

interface TemplateActions {
  // Template CRUD operations
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName?: string) => Promise<void>;
  getTemplate: (id: string) => Template | undefined;
  
  // Template usage tracking
  incrementUsage: (id: string) => void;
  
  // UI state management
  setCurrentTemplate: (template: Template | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: TemplateCategory | 'all') => void;
  clearError: () => void;
  
  // Computed getters
  getFilteredTemplates: () => Template[];
  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  getTotalTemplates: () => number;
  getActiveTemplates: () => Template[];
  getMostUsedTemplates: (limit?: number) => Template[];
  
  // Default templates
  initializeDefaultTemplates: () => Promise<void>;
  
  // Utility functions
  cleanupCorruptedData: () => void;
}

export const useTemplateStore = create<TemplateState & TemplateActions>()(
  persist(
    (set, get) => ({
      // Initial State
      templates: [],
      currentTemplate: null,
      searchTerm: '',
      selectedCategory: 'all',
      isLoading: false,
      error: null,

      // Actions
      addTemplate: async (templateData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newTemplate: Template = {
            ...templateData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
            version: '1.0',
            authorName: 'צפי כהן'
          };
          
          set((state) => ({
            templates: [...state.templates, newTemplate],
            isLoading: false,
          }));
          
          console.log('תבנית חדשה נוספה:', newTemplate.name);
        } catch (error) {
          set({ 
            error: 'שגיאה בהוספת התבנית. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          set((state) => ({
            templates: state.templates.map((template) =>
              template.id === id
                ? { ...template, ...updates, updatedAt: new Date() }
                : template
            ),
            currentTemplate:
              state.currentTemplate?.id === id
                ? { ...state.currentTemplate, ...updates, updatedAt: new Date() }
                : state.currentTemplate,
            isLoading: false,
          }));
          
          console.log('התבנית עודכנה בהצלחה');
        } catch (error) {
          set({ 
            error: 'שגיאה בעדכון התבנית. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      deleteTemplate: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const template = get().templates.find(t => t.id === id);
          if (!template) {
            throw new Error('תבנית לא נמצאה');
          }
          
          set((state) => ({
            templates: state.templates.filter((template) => template.id !== id),
            currentTemplate:
              state.currentTemplate?.id === id ? null : state.currentTemplate,
            isLoading: false,
          }));
          
          console.log('התבנית נמחקה מהמערכת:', template.name);
        } catch (error) {
          set({ 
            error: 'שגיאה במחיקת התבנית. אנא נסי שוב.',
            isLoading: false 
          });
        }
      },

      duplicateTemplate: async (templateId, newName) => {
        try {
          const original = get().getTemplate(templateId);
          if (!original) {
            throw new Error('תבנית לא נמצאה');
          }

          const duplicate = {
            ...original,
            name: newName || `העתק של ${original.name}`,
            usageCount: 0
          };

          // Remove id, createdAt, updatedAt to let addTemplate handle them
          const { id, createdAt, updatedAt, ...templateData } = duplicate;
          
          await get().addTemplate(templateData);
        } catch (error) {
          set({ error: 'שגיאה בשכפול התבנית. אנא נסי שוב.' });
        }
      },

      getTemplate: (id) => {
        return get().templates.find(template => template.id === id);
      },

      incrementUsage: (id) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, usageCount: template.usageCount + 1 }
              : template
          )
        }));
      },

      setCurrentTemplate: (template) => {
        set({ currentTemplate: template });
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      clearError: () => {
        set({ error: null });
      },

      // Computed getters
      getFilteredTemplates: () => {
        const { templates, searchTerm, selectedCategory } = get();
        let result = templates;
        
        // Filter by category
        if (selectedCategory !== 'all') {
          result = result.filter(template => template.category === selectedCategory);
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          result = result.filter(template => 
            template.name.toLowerCase().includes(term) ||
            template.description.toLowerCase().includes(term) ||
            template.category.toLowerCase().includes(term)
          );
        }
        
        // Sort by usage count and then by name
        return result.sort((a, b) => {
          if (a.usageCount !== b.usageCount) {
            return b.usageCount - a.usageCount;
          }
          return a.name.localeCompare(b.name, 'he');
        });
      },

      getTemplatesByCategory: (category) => {
        return get().templates.filter(template => 
          template.category === category && template.isActive
        );
      },

      getTotalTemplates: () => {
        return get().templates.length;
      },

      getActiveTemplates: () => {
        return get().templates.filter(template => template.isActive);
      },

      getMostUsedTemplates: (limit = 5) => {
        return get().templates
          .filter(template => template.isActive)
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },

      initializeDefaultTemplates: async () => {
        const { templates, addTemplate } = get();
        
        // Only initialize if no templates exist
        if (templates.length > 0) {
          return;
        }

        try {
          set({ isLoading: true });
          
          // Import default templates dynamically to avoid naming conflicts
          const templateModule = await import('@/types/template');
          const defaultTemplates = templateModule.DEFAULT_TEMPLATES;
          
          for (const templateData of defaultTemplates) {
            await addTemplate({
              name: templateData.name || 'תבנית ללא שם',
              description: templateData.description || '',
              category: templateData.category || 'custom',
              fields: templateData.fields || [],
              content: templateData.content || '',
              isActive: true,
              version: '1.0'
            });
          }
          
          console.log('תבניות ברירת מחדל נוספו בהצלחה');
        } catch (error) {
          console.error('שגיאה באתחול תבניות ברירת מחדל:', error);
          set({ error: 'שגיאה באתחול תבניות ברירת מחדל' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Utility function to clean up corrupted data
      cleanupCorruptedData: () => {
        try {
          const { templates } = get();
          const cleanedTemplates = templates.filter(template => {
            // Check if template has valid dates
            return template.createdAt && 
                   template.updatedAt && 
                   !isNaN(new Date(template.createdAt).getTime()) &&
                   !isNaN(new Date(template.updatedAt).getTime());
          }).map(template => ({
            ...template,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt)
          }));

          set({ templates: cleanedTemplates });
          console.log('נתונים מקולקלים נוקו בהצלחה');
        } catch (error) {
          console.error('שגיאה בניקוי נתונים:', error);
          // If cleanup fails, clear all data
          set({ templates: [] });
        }
      },
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({
        templates: state.templates,
        // Don't persist UI state like currentTemplate, searchTerm, etc.
      }),
    }
  )
);