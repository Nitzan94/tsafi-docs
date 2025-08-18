# מדריך יצוא מסמכים לפורמט Word

## סקירה כללית

מערכת יצוא Word מאפשרת המרת נתוני מטופלים ומסמכי טיפול לקבצי Word מקצועיים עם תמיכה מלאה בעברית וכיוון RTL. המערכת מספקת יכולות יצוא מתקדמות תוך שמירה על פרטיות המטופלים ועמידה בסטנדרטים רפואיים.

## תכונות עיקריות

- ✅ **תמיכה מלאה בעברית ו-RTL** - גופן `Arial Unicode MS` וכיוון קריאה נכון
- ✅ **תבניות מקצועיות** - תבניות מובנות לסוגי מסמכים שונים
- ✅ **אליקציה מקיפה** - בדיקת תקינות נתונים לפני היצוא
- ✅ **יצוא אצווה** - יצוא מספר מטופלים במקביל
- ✅ **הודעות משוב** - הודעות ברורות על הצלחה וכישלון
- ✅ **אבטחת מידע** - עיבוד צד לקוח ללא שליחת נתונים לשרת

## התקנה

החבילות הנדרשות מותקנות במערכת:

```bash
npm install docx file-saver
npm install -D @types/file-saver
```

## שימוש בסיסי

### יצוא נתוני מטופל

```typescript
import { useWordExport } from '@/hooks/useWordExport';
import type { Patient } from '@/types';

const MyComponent = () => {
  const { exportPatient, isExporting, error } = useWordExport({
    onExportSuccess: (fileName) => {
      console.log(`קובץ נוצר: ${fileName}`);
    },
    onExportError: (error) => {
      console.error('שגיאה ביצוא:', error);
    }
  });

  const handleExport = async (patient: Patient) => {
    try {
      await exportPatient(patient, {
        includeMedicalHistory: true,
        includeSignature: true,
        physiotherapistName: 'ד"ר שרה לוי',
        licenseNumber: 'PT-12345'
      });
    } catch (error) {
      console.error('יצוא נכשל:', error);
    }
  };

  return (
    <button 
      onClick={() => handleExport(patient)}
      disabled={isExporting}
    >
      {isExporting ? 'מייצא...' : 'יצוא לWord'}
    </button>
  );
};
```

### יצוא דו"ח טיפול

```typescript
import type { Patient, GeneratedDocument } from '@/types';

const handleExportReport = async (
  patient: Patient, 
  document: GeneratedDocument
) => {
  await exportTreatmentReport(patient, document, {
    includeSignatureSection: true,
    physiotherapistName: 'ד"ר שרה לוי',
    licenseNumber: 'PT-12345'
  });
};
```

## רכיבי UI מוכנים

### כפתור יצוא בסיסי

```typescript
import { PatientWordExportButton } from '@/components/UI/WordExportButton';

<PatientWordExportButton
  patient={patient}
  variant="primary"
  size="md"
  options={{
    includeMedicalHistory: true,
    includeSignature: true,
    physiotherapistName: 'ד"ר שרה לוי',
    licenseNumber: 'PT-12345'
  }}
/>
```

### כפתור יצוא מסמך

```typescript
import { DocumentWordExportButton } from '@/components/UI/WordExportButton';

<DocumentWordExportButton
  patient={patient}
  document={document}
  variant="secondary"
  showLabel={true}
  showToast={true}
/>
```

### יצוא אצווה

```typescript
import { BatchWordExportButton } from '@/components/UI/WordExportButton';

<BatchWordExportButton
  patients={selectedPatients}
  onComplete={(results) => {
    console.log(`יוצאו בהצלחה: ${results.completed.length}`);
    console.log(`שגיאות: ${results.errors.length}`);
  }}
/>
```

## תבניות מובנות

### תבנית הערכה ראשונית

```typescript
import { PhysiotherapyTemplates } from '@/templates/physiotherapyTemplates';

const assessmentTemplate = PhysiotherapyTemplates.getInitialAssessmentTemplate();
```

**שדות כלולים:**
- תלונה עיקרית
- היסטוריית המחלה הנוכחית
- היסטוריה רפואית קודמת
- תרופות נוכחיות
- רמת כאב (0-10)
- מגבלות פונקציונליות
- בדיקה גופנית
- הערכה ואבחנה
- מטרות הטיפול
- תכנית הטיפול

### תבנית דו"ח התקדמות

```typescript
const progressTemplate = PhysiotherapyTemplates.getProgressNoteTemplate();
```

**שדות כלולים:**
- תאריך ומספר הטיפול
- דיווח סובייקטיבי (S)
- ממצאים אובייקטיביים (O)
- טיפול שניתן
- תגובה לטיפול
- תכנית להמשך (P)
- תרגילי בית

### תבנית תכנית טיפול

```typescript
const treatmentPlanTemplate = PhysiotherapyTemplates.getTreatmentPlanTemplate();
```

### תבנית סיכום שחרור

```typescript
const dischargeSummaryTemplate = PhysiotherapyTemplates.getDischargeSummaryTemplate();
```

## אליקציה ובקרת איכות

### בדיקת תקינות מטופל

```typescript
import { DocumentValidator } from '@/utils/documentValidation';

const validation = DocumentValidator.validatePatientData(patient);

if (!validation.isValid) {
  console.error('שגיאות:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('אזהרות:', validation.warnings);
}
```

### בדיקת נכונות ליצוא

```typescript
const { canExportPatient, getPatientExportIssues } = useWordExport();

const isReady = canExportPatient(patient);
const issues = getPatientExportIssues(patient);

if (!isReady) {
  console.log('בעיות:', issues);
}
```

## התאמה אישית

### הגדרות יצוא מותאמות

```typescript
const exportOptions = {
  // כלול היסטוריה רפואית
  includeMedicalHistory: true,
  
  // כלול אזור חתימה
  includeSignature: true,
  
  // פרטי פיזיותרפיסט
  physiotherapistName: 'ד"ר שרה לוי',
  licenseNumber: 'PT-12345',
  
  // הגדרות ניקוי נתונים
  sanitize: {
    includeFullId: false,      // מיסוך תעודת זהות
    includeEmail: true,        // כלול אימייל
    includePhone: true         // כלול טלפון
  }
};
```

### הגדרות ברירת מחדל

```typescript
const { exportPatient } = useWordExport({
  defaultExportOptions: {
    physiotherapistName: 'ד"ר שרה לוי',
    licenseNumber: 'PT-12345',
    includeSignatureSection: true
  },
  showValidationWarnings: true,
  autoSanitize: true
});
```

## מבנה המסמך המיוצא

### כותרת המסמך
- כותרת ראשית בעברית
- תאריך יצירה
- פרטי מטופל בסיסיים

### פרטי המטופל
| שדה | תיאור |
|------|--------|
| שם מלא | שם פרטי ומשפחה |
| תעודת זהות | מספר תעודת זהות (ניתן למיסוך) |
| תאריך לידה | בפורמט עברי |
| טלפון | בפורמט ישראלי |
| אימייל | כתובת אימייל (אופציונלי) |
| כתובת | כתובת מלאה |

### היסטוריה רפואית
טבלה מובנית עם:
- תאריך
- אבחנה
- טיפול
- הערות

### אזור חתימה
- שורת תאריך וחתימה
- שם הפיזיותרפיסט
- מספר רישיון

## טיפול בשגיאות

### שגיאות אליקציה

```typescript
try {
  await exportPatient(patient);
} catch (error) {
  if (error.message.includes('שגיאות באליקציה')) {
    // טפל בשגיאות אליקציה
    console.error('נתונים לא תקינים:', error);
  }
}
```

### שגיאות יצוא

```typescript
const { exportPatient, error, clearError } = useWordExport({
  onExportError: (error) => {
    // הצג הודעת שגיאה למשתמש
    alert(`שגיאה ביצוא: ${error.message}`);
  }
});

// ניקוי שגיאה
if (error) {
  clearError();
}
```

## אבטחה ופרטיות

### עיבוד צד לקוח
כל עיבוד הנתונים מתבצע בדפדפן הלקוח:
- ✅ אין שליחת נתוני מטופלים לשרת
- ✅ הנתונים נשארים במחשב המקומי
- ✅ יצירת הקובץ מתבצעת במלואה בדפדפן

### ניקוי נתונים רגישים

```typescript
import { DataSanitizer } from '@/utils/documentValidation';

const sanitizedPatient = DataSanitizer.sanitizePatientForExport(patient, {
  includeFullId: false,      // מיסוך ת.ז.: 123***789
  includeEmail: false,       // הסתרת אימייל
  includePhone: false        // מיסוך טלפון: 050****567
});
```

### אליקציה רפואית
המערכת כוללת בדיקות ספציפיות לתחום הרפואי:
- בדיקת תקינות תעודת זהות ישראלית
- אליקציה פורמט מספרי טלפון ישראליים
- בדיקת גיל והגיוניות תאריכים
- איתור מידע רגיש בתוכן המסמכים

## ביצועים ואופטימיזציה

### טעינה עצלה

```typescript
// טעינה דינמית של פונקציונליות היצוא
const exportToWord = async (patient: Patient) => {
  const { PhysioWordExporter } = await import('@/utils/wordExport');
  const exporter = new PhysioWordExporter();
  await exporter.exportPatientDocument(patient);
};
```

### יצוא אצווה מיטוב

```typescript
const { exportMultiplePatients, batchProgress } = useBatchWordExport();

await exportMultiplePatients(patients, {
  // השהייה קטנה בין יצואים למניעת קפיאת דפדפן
  delayBetweenExports: 100,
  
  // מספר מקסימלי של יצואים במקביל
  concurrencyLimit: 3
});
```

## תמיכה בדפדפנים

### דפדפנים נתמכים
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### בדיקת תמיכה

```typescript
const checkWordExportSupport = (): boolean => {
  return !!(
    window.Blob && 
    window.URL && 
    window.URL.createObjectURL &&
    document.createElement('a').download !== undefined
  );
};

if (!checkWordExportSupport()) {
  // פתרון חלופי - יצוא ל-PDF
  await exportToPDF(patient);
}
```

## דוגמאות נוספות

### יצוא עם הודעות מותאמות

```typescript
const { exportPatient } = useWordExport({
  onExportStart: () => {
    setLoading(true);
    showMessage('מתחיל יצוא מסמך...', 'info');
  },
  onExportSuccess: (fileName) => {
    setLoading(false);
    showMessage(`המסמך נוצר בהצלחה: ${fileName}`, 'success');
  },
  onExportError: (error) => {
    setLoading(false);
    showMessage(`שגיאה ביצוא: ${error.message}`, 'error');
  }
});
```

### שילוב עם רכיב קיים

```typescript
// בתוך PatientCard component
import { useWordExport } from '@/hooks/useWordExport';

const PatientCard = ({ patient }) => {
  const { exportPatient, isExporting } = useWordExport();

  return (
    <div className="patient-card">
      {/* פרטי מטופל */}
      
      <button
        onClick={() => exportPatient(patient)}
        disabled={isExporting}
        className="export-btn"
      >
        {isExporting ? 'מייצא...' : 'יצוא לWord'}
      </button>
    </div>
  );
};
```

## פתרון תקלות נפוצות

### בעיה: הקובץ לא נשמר
**פתרון:** ודא שהדפדפן תומך בהורדת קבצים והרשאות מותרות.

### בעיה: טקסט לא מוצג בעברית
**פתרון:** ודא שהגופן `Arial Unicode MS` זמין במערכת.

### בעיה: יצוא איטי
**פתרון:** השתמש ביצוא אצווה או טעינה דינמית.

### בעיה: שגיאות אליקציה
**פתרון:** השתמש ב-`DocumentValidator` לבדיקה מוקדמת.

---

## תמיכה טכנית

לשאלות ובעיות טכניות, עיין במדריך הפיתוח או פתח issue בפרויקט GitHub.