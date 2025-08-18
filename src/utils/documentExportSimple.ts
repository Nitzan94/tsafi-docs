import { 
  Document as DocxDocument, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType,
  TextDirection
} from 'docx';
import type { Document, Template, TemplateField } from '@/types/template';
import type { Patient } from '@/types';
import { formatHebrewDate } from './hebrew';

interface ExportData {
  document: Document;
  template: Template;
  patient: Patient;
}

export class WordDocumentExporter {
  private data: ExportData;

  constructor(data: ExportData) {
    this.data = data;
  }

  /**
   * יצוא המסמך כקובץ Word מעוצב ומקצועי
   */
  async exportToWord(): Promise<void> {
    try {
      const { document, template, patient } = this.data;
      
      const paragraphs = [
      // כותרת המסמך
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        rightToLeft: true,
        children: [
          new TextRun({
            text: document.name,
            bold: true,
            size: 32,
            color: "2E74B5",
            font: "Arial",
            rightToLeft: true,
            bidirectional: true
          })
        ]
      }),

      // פרטי המטופל - רק אם הוגדר להציג
      ...(document.displaySettings?.showPatientDetails ?? true ? [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 180 },
          rightToLeft: true,
          children: [
            new TextRun({
              text: "פרטי המטופל",
              bold: true,
              size: 24,
              color: "365F91",
              font: "Arial",
              rightToLeft: true,
              bidirectional: true
            })
          ]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
          rightToLeft: true,
          children: [
            new TextRun({ 
              text: `שם מלא: `,
              font: "Arial",
              rightToLeft: true,
              bidirectional: true,
              bold: true,
              color: "365F91"
            }),
            new TextRun({ 
              text: `${patient.firstName} ${patient.lastName}`, 
              font: "Arial",
              rightToLeft: true,
              bidirectional: true
            })
          ]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
          rightToLeft: true,
          children: [
            new TextRun({ 
              text: `תעודת זהות: `,
              font: "Arial",
              rightToLeft: true,
              bidirectional: true,
              bold: true,
              color: "365F91"
            }),
            new TextRun({ 
              text: `${patient.idNumber}`, 
              font: "Arial",
              rightToLeft: true,
              bidirectional: true
            })
          ]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
          rightToLeft: true,
          children: [
            new TextRun({ 
              text: `גיל: `,
              font: "Arial",
              rightToLeft: true,
              bidirectional: true,
              bold: true,
              color: "365F91"
            }),
            new TextRun({ 
              text: `${this.calculateAge(patient.birthDate)}`, 
              font: "Arial",
              rightToLeft: true,
              bidirectional: true
            })
          ]
        }),

        // פרטי קשר - רק אם הוגדר להציג
        ...(document.displaySettings?.showContactDetails ?? true ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            rightToLeft: true,
            children: [
              new TextRun({ 
                text: `טלפון: `,
                font: "Arial",
                rightToLeft: true,
                bidirectional: true,
                bold: true,
                color: "365F91"
              }),
              new TextRun({ 
                text: `${patient.phone}`, 
                font: "Arial",
                rightToLeft: true,
                bidirectional: true
              })
            ]
          }),
        ] : [])
      ] : []),

      // מטא דאטה
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 300, after: 120 },
        rightToLeft: true,
        children: [
          new TextRun({ 
            text: `תאריך יצירה: `,
            font: "Arial", 
            size: 20, 
            color: "365F91",
            rightToLeft: true,
            bidirectional: true,
            bold: true
          }),
          new TextRun({ 
            text: `${formatHebrewDate(document.createdAt)}`, 
            font: "Arial", 
            size: 20, 
            color: "666666",
            rightToLeft: true,
            bidirectional: true
          })
        ]
      }),

        // תוכן המסמך
        ...this.createDocumentContent(template, document)
      ];

      // יצירת מסמך Word עם הגדרות RTL
      const doc = new DocxDocument({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440, 
                bottom: 1440,
                left: 1440
              }
            },
            textDirection: TextDirection.RIGHT_TO_LEFT,
            rightToLeft: true
          },
          children: paragraphs
        }]
      });

      // יצוא הקובץ לדפדפן
      const blob = await Packer.toBlob(doc);
      this.downloadBlob(blob, `${document.name}.docx`);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error(`שגיאה ביצוא קובץ Word: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    }
  }

  /**
   * יצירת תוכן המסמך עם עיבוד placeholders
   */
  private createDocumentContent(template: Template, document: Document): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // לא להוסיף תוכן תבנית בכלל - רק השדות הממולאים
    console.log('Template content:', template.content);
    console.log('Template fields:', template.fields);
    console.log('Document data:', document.data);
    
    // דילוג על תוכן התבנית לחלוטין - נציג רק שדות ממולאים
    const skipTemplateContent = true;
    
    if (false) { // לעולם לא להציג תוכן תבנית
      // פיצול לשורות ויצירת פסקאות
      const lines = processedContent.split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        // שורה ריקה - יצירת רווח
        paragraphs.push(new Paragraph({
          spacing: { after: 120 },
          rightToLeft: true,
          children: [new TextRun({ text: " ", font: "Arial", rightToLeft: true })]
        }));
      } else if (this.isHeading(line)) {
        // כותרת
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 180 },
          rightToLeft: true,
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              size: 24,
              color: "365F91",
              font: "Arial",
              rightToLeft: true
            })
          ]
        }));
      } else {
        // פסקה רגילה - עם טיפול מיוחד בירידות שורה
        const textContent = line.trim();
        if (textContent) {
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            rightToLeft: true,
            children: [
              new TextRun({
                text: textContent,
                font: "Arial",
                size: 22,
                rightToLeft: true
              })
            ]
          }));
        }
      }
    });
    }
    
    // הוספת שדות המסמך (ללא כותרת)
    if (template.fields && template.fields.length > 0) {
      // רווח לפני השדות
      paragraphs.push(new Paragraph({
        spacing: { before: 240 },
        rightToLeft: true,
        children: [new TextRun({ text: "", font: "Arial", rightToLeft: true })]
      }));

      template.fields.forEach(field => {
        const value = document.data?.[field.name];
        
        // רק אם יש ערך אמיתי, הוסף את השדה למסמך
        if (!value || value === '' || value === null || value === undefined || 
            (typeof value === 'string' && value.trim() === '')) {
          return; // דלג על שדות ריקים
        }
        
        const formattedValue = this.formatFieldValue(field, value);
        
        // אם הערך מכיל ירידות שורה, יצירת פסקאות נפרדות
        if (formattedValue.includes('\n')) {
          // יצירת תווית השדה
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 60 },
            rightToLeft: true,
            children: [
              new TextRun({
                text: `${field.label}`,
                font: "Arial",
                size: 22,
                bold: true,
                color: "365F91",
                rightToLeft: true,
                bidirectional: true
              }),
              new TextRun({
                text: `:`,
                font: "Arial",
                size: 22,
                bold: true,
                color: "365F91",
                rightToLeft: true,
                bidirectional: true
              })
            ]
          }));
          
          // יצירת פסקאות עבור כל שורה
          const lines = formattedValue.split('\n');
          lines.forEach(line => {
            paragraphs.push(new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 60 },
              rightToLeft: true,
              children: [
                new TextRun({
                  text: line.trim() || ' ',
                  font: "Arial",
                  size: 22,
                  rightToLeft: true
                })
              ]
            }));
          });
          
          // רווח אחרי השדה
          paragraphs.push(new Paragraph({
            spacing: { after: 120 },
            rightToLeft: true,
            children: [new TextRun({ text: " ", font: "Arial", rightToLeft: true })]
          }));
        } else {
          // שדה רגיל ללא ירידות שורה
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            rightToLeft: true,
            children: [
              new TextRun({
                text: `${field.label}: `,
                font: "Arial",
                size: 22,
                bold: true,
                color: "365F91",
                rightToLeft: true,
                bidirectional: true
              }),
              new TextRun({
                text: formattedValue,
                font: "Arial",
                size: 22,
                rightToLeft: true
              })
            ]
          }));
        }
      });
    }
    
    return paragraphs;
  }

  /**
   * עיבוד תוכן התבנית - החלפת placeholders
   */
  private processTemplateContent(content: string, fields: TemplateField[], data: Record<string, any>): string {
    let processed = content;
    
    // החלפת placeholders עם נתונים אמיתיים
    if (fields && data) {
      fields.forEach(field => {
        const placeholder = `{{${field.name}}}`;
        const value = data[field.name];
        const processedValue = value ? this.formatFieldValue(field, value) : '_____________________________';
        processed = processed.replace(new RegExp(placeholder, 'g'), processedValue);
      });
    }
    
    // החלפת placeholder של שם מטופל (עם בדיקת תקינות)
    const patientName = `${this.data.patient.firstName || ''} ${this.data.patient.lastName || ''}`.trim();
    processed = processed.replace(/{{patientName}}/g, patientName || 'שם לא זמין');
    
    // הסרת placeholders שלא הוחלפו
    processed = processed.replace(/{{[^}]+}}/g, '_____________________________');
    
    // טיפול מתקדם בירידות שורה - החלפת \r\n, \r ו-\n ל-\n אחיד
    processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    return processed;
  }

  /**
   * בדיקה האם השורה היא כותרת
   */
  private isHeading(line: string): boolean {
    return line.trim().endsWith(':') && line.trim().length < 50;
  }

  /**
   * עיצוב ערך שדה לפי הטיפוס
   */
  private formatFieldValue(field: TemplateField, value: any): string {
    switch (field.type) {
      case 'date':
        return formatHebrewDate(new Date(value));
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      case 'signature':
        return 'חתום דיגיטלית ✍️';
      default:
        return String(value);
    }
  }

  /**
   * חישוב גיל המטופל
   */
  private calculateAge(birthDate?: Date | string): string {
    if (!birthDate) return 'לא ידוע';
    const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (isNaN(dateObj.getTime())) return 'לא ידוע';
    const age = Math.floor((Date.now() - dateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${age}`;
  }

  /**
   * הורדת הקובץ מ-Blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }
}