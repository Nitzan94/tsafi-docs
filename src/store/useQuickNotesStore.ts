/**
 * Store לניהול הערות מהירות בסיידבר
 * מאפשר הוספה, מחיקה וצפייה בהערות עם שמירה ב-localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuickNote {
  id: string;
  content: string;
  createdAt: Date;
}

interface QuickNotesState {
  notes: QuickNote[];
  isLoading: boolean;
  error: string | null;
}

interface QuickNotesActions {
  // הוספת הערה חדשה
  addNote: (content: string) => void;
  
  // מחיקת הערה
  deleteNote: (id: string) => void;
  
  // קבלת כל ההערות (ממוינות לפי תאריך)
  getAllNotes: () => QuickNote[];
  
  // ניקוי שגיאות
  clearError: () => void;
  
  // ניקוי כל ההערות
  clearAllNotes: () => void;
}

export const useQuickNotesStore = create<QuickNotesState & QuickNotesActions>()(
  persist(
    (set, get) => ({
      // מצב התחלתי
      notes: [],
      isLoading: false,
      error: null,

      // הוספת הערה חדשה
      addNote: (content: string) => {
        try {
          // וידוא שהתוכן לא ריק
          const trimmedContent = content.trim();
          if (!trimmedContent) {
            set({ error: 'לא ניתן להוסיף הערה ריקה' });
            return;
          }

          const newNote: QuickNote = {
            id: crypto.randomUUID(),
            content: trimmedContent,
            createdAt: new Date(),
          };

          set((state) => ({
            notes: [newNote, ...state.notes], // הערות חדשות למעלה
            error: null,
          }));

          console.log('הערה חדשה נוספה:', trimmedContent);
        } catch (error) {
          set({ error: 'שגיאה בהוספת ההערה' });
          console.error('שגיאה בהוספת הערה:', error);
        }
      },

      // מחיקת הערה
      deleteNote: (id: string) => {
        try {
          const note = get().notes.find(n => n.id === id);
          if (!note) {
            set({ error: 'הערה לא נמצאה' });
            return;
          }

          set((state) => ({
            notes: state.notes.filter(note => note.id !== id),
            error: null,
          }));

          console.log('הערה נמחקה:', note.content);
        } catch (error) {
          set({ error: 'שגיאה במחיקת ההערה' });
          console.error('שגיאה במחיקת הערה:', error);
        }
      },

      // קבלת כל ההערות ממוינות לפי תאריך (חדשות למעלה)
      getAllNotes: () => {
        return get().notes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      // ניקוי שגיאות
      clearError: () => {
        set({ error: null });
      },

      // ניקוי כל ההערות
      clearAllNotes: () => {
        set({ notes: [], error: null });
        console.log('כל ההערות נוקו');
      },
    }),
    {
      name: 'quick-notes-storage',
      partialize: (state) => ({
        notes: state.notes,
        // לא נשמור UI state כמו error או loading
      }),
    }
  )
);