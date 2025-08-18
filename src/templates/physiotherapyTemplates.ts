import { DocumentTemplate, FieldType, TemplateCategory } from '../types';

/**
 * Predefined physiotherapy document templates with Hebrew content
 */
export class PhysiotherapyTemplates {
  /**
   * Initial Assessment Template
   */
  static getInitialAssessmentTemplate(): DocumentTemplate {
    return {
      id: 'initial-assessment',
      name: 'הערכה ראשונית',
      category: TemplateCategory.ASSESSMENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'chief-complaint',
          name: 'chiefComplaint',
          type: FieldType.TEXTAREA,
          label: 'תלונה עיקרית',
          placeholder: 'תאר את התלונה העיקרית של המטופל...',
          required: true,
          validation: [
            { type: 'required', message: 'תלונה עיקרית חובה' },
            { type: 'minLength', value: 10, message: 'תיאור קצר מדי' }
          ]
        },
        {
          id: 'history-present-illness',
          name: 'historyPresentIllness',
          type: FieldType.TEXTAREA,
          label: 'היסטוריית המחלה הנוכחית',
          placeholder: 'תאר את התפתחות הבעיה הנוכחית...',
          required: true,
          validation: [
            { type: 'required', message: 'היסטוריית המחלה חובה' }
          ]
        },
        {
          id: 'past-medical-history',
          name: 'pastMedicalHistory',
          type: FieldType.TEXTAREA,
          label: 'היסטוריה רפואית קודמת',
          placeholder: 'פציעות, ניתוחים, מחלות קודמות...',
          required: false,
          validation: []
        },
        {
          id: 'medications',
          name: 'medications',
          type: FieldType.TEXTAREA,
          label: 'תרופות נוכחיות',
          placeholder: 'רשימת תרופות שהמטופל נטל כיום...',
          required: false,
          validation: []
        },
        {
          id: 'pain-scale',
          name: 'painScale',
          type: FieldType.SELECT,
          label: 'רמת כאב (0-10)',
          required: true,
          options: [
            '0 - ללא כאב',
            '1 - כאב קל מאוד',
            '2 - כאב קל',
            '3 - כאב בינוני-קל',
            '4 - כאב בינוני',
            '5 - כאב בינוני-חזק',
            '6 - כאב חזק',
            '7 - כאב חזק מאוד',
            '8 - כאב קשה',
            '9 - כאב קשה מאוד',
            '10 - כאב בלתי נסבל'
          ],
          validation: [
            { type: 'required', message: 'רמת כאב חובה' }
          ]
        },
        {
          id: 'functional-limitations',
          name: 'functionalLimitations',
          type: FieldType.TEXTAREA,
          label: 'מגבלות פונקציונליות',
          placeholder: 'תאר מגבלות בפעילות יומיומית...',
          required: true,
          validation: [
            { type: 'required', message: 'מגבלות פונקציונליות חובות' }
          ]
        },
        {
          id: 'physical-examination',
          name: 'physicalExamination',
          type: FieldType.TEXTAREA,
          label: 'בדיקה גופנית',
          placeholder: 'ממצאי הבדיקה הגופנית...',
          required: true,
          validation: [
            { type: 'required', message: 'בדיקה גופנית חובה' }
          ]
        },
        {
          id: 'assessment',
          name: 'assessment',
          type: FieldType.TEXTAREA,
          label: 'הערכה ואבחנה',
          placeholder: 'הערכה מקצועית ואבחנה...',
          required: true,
          validation: [
            { type: 'required', message: 'הערכה ואבחנה חובות' }
          ]
        },
        {
          id: 'treatment-goals',
          name: 'treatmentGoals',
          type: FieldType.TEXTAREA,
          label: 'מטרות הטיפול',
          placeholder: 'מטרות קצרות טווח וארוכות טווח...',
          required: true,
          validation: [
            { type: 'required', message: 'מטרות הטיפול חובות' }
          ]
        },
        {
          id: 'treatment-plan',
          name: 'treatmentPlan',
          type: FieldType.TEXTAREA,
          label: 'תכנית הטיפול',
          placeholder: 'תכנית הטיפול המפורטת...',
          required: true,
          validation: [
            { type: 'required', message: 'תכנית הטיפול חובה' }
          ]
        }
      ],
      content: `
        <div class="physiotherapy-document rtl">
          <header class="document-header">
            <h1>הערכה ראשונית - פיזיותרפיה</h1>
            <div class="patient-info">
              <p><strong>תאריך:</strong> {{currentDate}}</p>
            </div>
          </header>

          <section class="assessment-section">
            <h2>תלונה עיקרית</h2>
            <p>{{chiefComplaint}}</p>

            <h2>היסטוריית המחלה הנוכחית</h2>
            <p>{{historyPresentIllness}}</p>

            <h2>היסטוריה רפואית קודמת</h2>
            <p>{{pastMedicalHistory}}</p>

            <h2>תרופות נוכחיות</h2>
            <p>{{medications}}</p>

            <h2>רמת כאב</h2>
            <p>{{painScale}}</p>

            <h2>מגבלות פונקציונליות</h2>
            <p>{{functionalLimitations}}</p>

            <h2>בדיקה גופנית</h2>
            <p>{{physicalExamination}}</p>

            <h2>הערכה ואבחנה</h2>
            <p>{{assessment}}</p>

            <h2>מטרות הטיפול</h2>
            <p>{{treatmentGoals}}</p>

            <h2>תכנית הטיפול</h2>
            <p>{{treatmentPlan}}</p>
          </section>

          <section class="signature-section">
            <div class="signature-line">
              <p>תאריך: ___________</p>
              <p>חתימת הפיזיותרפיסט: ___________</p>
            </div>
          </section>
        </div>
      `
    };
  }

  /**
   * Treatment Progress Note Template
   */
  static getProgressNoteTemplate(): DocumentTemplate {
    return {
      id: 'progress-note',
      name: 'דו"ח התקדמות',
      category: TemplateCategory.PROGRESS_NOTE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'session-date',
          name: 'sessionDate',
          type: FieldType.DATE,
          label: 'תאריך הטיפול',
          required: true,
          validation: [
            { type: 'required', message: 'תאריך הטיפול חובה' }
          ]
        },
        {
          id: 'session-number',
          name: 'sessionNumber',
          type: FieldType.NUMBER,
          label: 'מספר הטיפול',
          required: true,
          validation: [
            { type: 'required', message: 'מספר הטיפול חובה' },
            { type: 'min', value: 1, message: 'מספר הטיפול חייב להיות חיובי' }
          ]
        },
        {
          id: 'subjective',
          name: 'subjective',
          type: FieldType.TEXTAREA,
          label: 'דיווח סובייקטיבי',
          placeholder: 'מה המטופל מדווח על מצבו...',
          required: true,
          validation: [
            { type: 'required', message: 'דיווח סובייקטיבי חובה' }
          ]
        },
        {
          id: 'objective',
          name: 'objective',
          type: FieldType.TEXTAREA,
          label: 'ממצאים אובייקטיביים',
          placeholder: 'ממצאי בדיקה ומדידות...',
          required: true,
          validation: [
            { type: 'required', message: 'ממצאים אובייקטיביים חובה' }
          ]
        },
        {
          id: 'treatment-given',
          name: 'treatmentGiven',
          type: FieldType.TEXTAREA,
          label: 'טיפול שניתן',
          placeholder: 'פירוט הטיפול שניתן במפגש...',
          required: true,
          validation: [
            { type: 'required', message: 'פירוט הטיפול חובה' }
          ]
        },
        {
          id: 'response-to-treatment',
          name: 'responseToTreatment',
          type: FieldType.TEXTAREA,
          label: 'תגובה לטיפול',
          placeholder: 'איך המטופל הגיב לטיפול...',
          required: true,
          validation: [
            { type: 'required', message: 'תגובה לטיפול חובה' }
          ]
        },
        {
          id: 'plan',
          name: 'plan',
          type: FieldType.TEXTAREA,
          label: 'תכנית להמשך',
          placeholder: 'תכנית לטיפולים הבאים...',
          required: true,
          validation: [
            { type: 'required', message: 'תכנית להמשך חובה' }
          ]
        },
        {
          id: 'homework',
          name: 'homework',
          type: FieldType.TEXTAREA,
          label: 'תרגילי בית',
          placeholder: 'תרגילים והנחיות לביצוע בבית...',
          required: false,
          validation: []
        }
      ],
      content: `
        <div class="physiotherapy-document rtl">
          <header class="document-header">
            <h1>דו"ח התקדמות - פיזיותרפיה</h1>
            <div class="session-info">
              <p><strong>תאריך הטיפול:</strong> {{sessionDate}}</p>
              <p><strong>מספר הטיפול:</strong> {{sessionNumber}}</p>
            </div>
          </header>

          <section class="progress-section">
            <h2>דיווח סובייקטיבי (S)</h2>
            <p>{{subjective}}</p>

            <h2>ממצאים אובייקטיביים (O)</h2>
            <p>{{objective}}</p>

            <h2>טיפול שניתן</h2>
            <p>{{treatmentGiven}}</p>

            <h2>תגובה לטיפול</h2>
            <p>{{responseToTreatment}}</p>

            <h2>תכנית להמשך (P)</h2>
            <p>{{plan}}</p>

            <h2>תרגילי בית</h2>
            <p>{{homework}}</p>
          </section>

          <section class="signature-section">
            <div class="signature-line">
              <p>תאריך: ___________</p>
              <p>חתימת הפיזיותרפיסט: ___________</p>
            </div>
          </section>
        </div>
      `
    };
  }

  /**
   * Treatment Plan Template
   */
  static getTreatmentPlanTemplate(): DocumentTemplate {
    return {
      id: 'treatment-plan',
      name: 'תכנית טיפול',
      category: TemplateCategory.TREATMENT_PLAN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'diagnosis',
          name: 'diagnosis',
          type: FieldType.TEXTAREA,
          label: 'אבחנה',
          placeholder: 'האבחנה המקצועית...',
          required: true,
          validation: [
            { type: 'required', message: 'אבחנה חובה' }
          ]
        },
        {
          id: 'short-term-goals',
          name: 'shortTermGoals',
          type: FieldType.TEXTAREA,
          label: 'מטרות קצרות טווח (1-4 שבועות)',
          placeholder: 'מטרות לטווח הקצר...',
          required: true,
          validation: [
            { type: 'required', message: 'מטרות קצרות טווח חובות' }
          ]
        },
        {
          id: 'long-term-goals',
          name: 'longTermGoals',
          type: FieldType.TEXTAREA,
          label: 'מטרות ארוכות טווח (1-3 חודשים)',
          placeholder: 'מטרות לטווח הארוך...',
          required: true,
          validation: [
            { type: 'required', message: 'מטרות ארוכות טווח חובות' }
          ]
        },
        {
          id: 'treatment-frequency',
          name: 'treatmentFrequency',
          type: FieldType.SELECT,
          label: 'תדירות הטיפול',
          required: true,
          options: [
            'פעמיים בשבוע',
            'שלוש פעמים בשבוע',
            'פעם בשבוע',
            'פעמיים בחודש',
            'לפי הצורך'
          ],
          validation: [
            { type: 'required', message: 'תדירות הטיפול חובה' }
          ]
        },
        {
          id: 'treatment-duration',
          name: 'treatmentDuration',
          type: FieldType.SELECT,
          label: 'משך הטיפול המשוער',
          required: true,
          options: [
            '2-4 שבועות',
            '1-2 חודשים',
            '2-3 חודשים',
            '3-6 חודשים',
            'יותר מ-6 חודשים'
          ],
          validation: [
            { type: 'required', message: 'משך הטיפול חובה' }
          ]
        },
        {
          id: 'treatment-methods',
          name: 'treatmentMethods',
          type: FieldType.TEXTAREA,
          label: 'שיטות טיפול',
          placeholder: 'פירוט שיטות הטיפול שייושמו...',
          required: true,
          validation: [
            { type: 'required', message: 'שיטות טיפול חובות' }
          ]
        },
        {
          id: 'home-program',
          name: 'homeProgram',
          type: FieldType.TEXTAREA,
          label: 'תכנית ביתית',
          placeholder: 'תרגילים והנחיות לביצוע עצמאי...',
          required: false,
          validation: []
        },
        {
          id: 'precautions',
          name: 'precautions',
          type: FieldType.TEXTAREA,
          label: 'אמצעי זהירות והנחיות',
          placeholder: 'אמצעי זהירות והנחיות חשובות...',
          required: false,
          validation: []
        },
        {
          id: 'reassessment-date',
          name: 'reassessmentDate',
          type: FieldType.DATE,
          label: 'תאריך הערכה חוזרת',
          required: true,
          validation: [
            { type: 'required', message: 'תאריך הערכה חוזרת חובה' }
          ]
        }
      ],
      content: `
        <div class="physiotherapy-document rtl">
          <header class="document-header">
            <h1>תכנית טיפול - פיזיותרפיה</h1>
            <div class="plan-info">
              <p><strong>תאריך יצירת התכנית:</strong> {{currentDate}}</p>
              <p><strong>תאריך הערכה חוזרת:</strong> {{reassessmentDate}}</p>
            </div>
          </header>

          <section class="treatment-plan-section">
            <h2>אבחנה</h2>
            <p>{{diagnosis}}</p>

            <h2>מטרות קצרות טווח (1-4 שבועות)</h2>
            <p>{{shortTermGoals}}</p>

            <h2>מטרות ארוכות טווח (1-3 חודשים)</h2>
            <p>{{longTermGoals}}</p>

            <h2>פרמטרי הטיפול</h2>
            <p><strong>תדירות:</strong> {{treatmentFrequency}}</p>
            <p><strong>משך משוער:</strong> {{treatmentDuration}}</p>

            <h2>שיטות טיפול</h2>
            <p>{{treatmentMethods}}</p>

            <h2>תכנית ביתית</h2>
            <p>{{homeProgram}}</p>

            <h2>אמצעי זהירות והנחיות</h2>
            <p>{{precautions}}</p>
          </section>

          <section class="signature-section">
            <div class="signature-line">
              <p>תאריך: ___________</p>
              <p>חתימת הפיזיותרפיסט: ___________</p>
            </div>
          </section>
        </div>
      `
    };
  }

  /**
   * Discharge Summary Template
   */
  static getDischargeSummaryTemplate(): DocumentTemplate {
    return {
      id: 'discharge-summary',
      name: 'סיכום שחרור',
      category: TemplateCategory.DISCHARGE_SUMMARY,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'admission-date',
          name: 'admissionDate',
          type: FieldType.DATE,
          label: 'תאריך תחילת הטיפול',
          required: true,
          validation: [
            { type: 'required', message: 'תאריך תחילת הטיפול חובה' }
          ]
        },
        {
          id: 'discharge-date',
          name: 'dischargeDate',
          type: FieldType.DATE,
          label: 'תאריך סיום הטיפול',
          required: true,
          validation: [
            { type: 'required', message: 'תאריך סיום הטיפול חובה' }
          ]
        },
        {
          id: 'total-sessions',
          name: 'totalSessions',
          type: FieldType.NUMBER,
          label: 'מספר הטיפולים הכולל',
          required: true,
          validation: [
            { type: 'required', message: 'מספר הטיפולים חובה' },
            { type: 'min', value: 1, message: 'חייב להיות טיפול אחד לפחות' }
          ]
        },
        {
          id: 'initial-condition',
          name: 'initialCondition',
          type: FieldType.TEXTAREA,
          label: 'מצב בתחילת הטיפול',
          placeholder: 'תיאור המצב בתחילת הטיפול...',
          required: true,
          validation: [
            { type: 'required', message: 'מצב ראשוני חובה' }
          ]
        },
        {
          id: 'treatment-summary',
          name: 'treatmentSummary',
          type: FieldType.TEXTAREA,
          label: 'סיכום הטיפול שניתן',
          placeholder: 'סיכום הטיפולים והפעילויות שנעשו...',
          required: true,
          validation: [
            { type: 'required', message: 'סיכום הטיפול חובה' }
          ]
        },
        {
          id: 'final-condition',
          name: 'finalCondition',
          type: FieldType.TEXTAREA,
          label: 'מצב בסיום הטיפול',
          placeholder: 'תיאור המצב בסיום הטיפול...',
          required: true,
          validation: [
            { type: 'required', message: 'מצב סופי חובה' }
          ]
        },
        {
          id: 'goals-achieved',
          name: 'goalsAchieved',
          type: FieldType.TEXTAREA,
          label: 'מטרות שהושגו',
          placeholder: 'רשימת המטרות שהושגו במהלך הטיפול...',
          required: true,
          validation: [
            { type: 'required', message: 'מטרות שהושגו חובות' }
          ]
        },
        {
          id: 'discharge-reason',
          name: 'dischargeReason',
          type: FieldType.SELECT,
          label: 'סיבת השחרור',
          required: true,
          options: [
            'השגת המטרות',
            'שיפור מקסימלי',
            'בקשת המטופל',
            'אי שיתוף',
            'מעבר לטיפול אחר',
            'סיבות רפואיות',
            'אחר'
          ],
          validation: [
            { type: 'required', message: 'סיבת השחרור חובה' }
          ]
        },
        {
          id: 'recommendations',
          name: 'recommendations',
          type: FieldType.TEXTAREA,
          label: 'המלצות להמשך',
          placeholder: 'המלצות לשמירה על השיפור או טיפול נוסף...',
          required: false,
          validation: []
        },
        {
          id: 'follow-up',
          name: 'followUp',
          type: FieldType.TEXTAREA,
          label: 'מעקב נדרש',
          placeholder: 'צורך במעקב או בדיקות נוספות...',
          required: false,
          validation: []
        }
      ],
      content: `
        <div class="physiotherapy-document rtl">
          <header class="document-header">
            <h1>סיכום שחרור - פיזיותרפיה</h1>
            <div class="discharge-info">
              <p><strong>תאריך תחילת הטיפול:</strong> {{admissionDate}}</p>
              <p><strong>תאריך סיום הטיפול:</strong> {{dischargeDate}}</p>
              <p><strong>מספר טיפולים כולל:</strong> {{totalSessions}}</p>
            </div>
          </header>

          <section class="discharge-section">
            <h2>מצב בתחילת הטיפול</h2>
            <p>{{initialCondition}}</p>

            <h2>סיכום הטיפול שניתן</h2>
            <p>{{treatmentSummary}}</p>

            <h2>מצב בסיום הטיפול</h2>
            <p>{{finalCondition}}</p>

            <h2>מטרות שהושגו</h2>
            <p>{{goalsAchieved}}</p>

            <h2>סיבת השחרור</h2>
            <p>{{dischargeReason}}</p>

            <h2>המלצות להמשך</h2>
            <p>{{recommendations}}</p>

            <h2>מעקב נדרש</h2>
            <p>{{followUp}}</p>
          </section>

          <section class="signature-section">
            <div class="signature-line">
              <p>תאריך: ___________</p>
              <p>חתימת הפיזיותרפיסט: ___________</p>
            </div>
          </section>
        </div>
      `
    };
  }

  /**
   * Get all available templates
   */
  static getAllTemplates(): DocumentTemplate[] {
    return [
      this.getInitialAssessmentTemplate(),
      this.getProgressNoteTemplate(),
      this.getTreatmentPlanTemplate(),
      this.getDischargeSummaryTemplate()
    ];
  }

  /**
   * Get template by ID
   */
  static getTemplateById(id: string): DocumentTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(template => template.id === id) || null;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: TemplateCategory): DocumentTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(template => template.category === category);
  }
}