import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageOrientation,
  SectionType,
  UnderlineType
} from 'docx';
import { saveAs } from 'file-saver';
import type { Patient, GeneratedDocument, MedicalRecord } from '../types';

export interface WordExportOptions {
  includeHeader?: boolean;
  includeMedicalHistory?: boolean;
  includeSignatureSection?: boolean;
  physiotherapistName?: string;
  licenseNumber?: string;
}

export class PhysioWordExporter {
  private readonly hebrewFont = 'Arial Unicode MS';
  private readonly fontSize = 22; // 11pt in half-points
  private readonly titleSize = 32; // 16pt in half-points

  /**
   * Export patient document to Word format
   */
  async exportPatientDocument(
    patient: Patient,
    options: WordExportOptions = {}
  ): Promise<void> {
    try {
      const doc = this.createPatientDocument(patient, options);
      const blob = await Packer.toBlob(doc);
      const fileName = this.generateFileName(patient);
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error exporting patient document to Word:', error);
      throw new Error('שגיאה ביצוא המסמך לפורמט Word');
    }
  }

  /**
   * Export treatment report to Word format
   */
  async exportTreatmentReport(
    patient: Patient,
    document: GeneratedDocument,
    options: WordExportOptions = {}
  ): Promise<void> {
    try {
      const doc = this.createTreatmentReport(patient, document, options);
      const blob = await Packer.toBlob(doc);
      const fileName = this.generateTreatmentFileName(patient, document);
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error exporting treatment report to Word:', error);
      throw new Error('שגיאה ביצוא דו"ח הטיפול לפורמט Word');
    }
  }

  private createPatientDocument(
    patient: Patient,
    options: WordExportOptions
  ): Document {
    const sections = [];

    // Create document sections
    const children: (Paragraph | Table)[] = [];

    if (options.includeHeader !== false) {
      children.push(...this.createDocumentHeader());
    }

    children.push(...this.createPatientDetailsSection(patient));
    
    if (options.includeMedicalHistory !== false && patient.medicalHistory?.length > 0) {
      children.push(...this.createMedicalHistorySection(patient.medicalHistory));
    }

    if (options.includeSignatureSection !== false) {
      children.push(...this.createSignatureSection(options));
    }

    sections.push({
      properties: {
        page: {
          margin: {
            top: 720,    // 0.5 inch
            right: 720,
            bottom: 720,
            left: 720
          },
          size: {
            orientation: PageOrientation.PORTRAIT
          }
        },
        type: SectionType.CONTINUOUS
      },
      children
    });

    return new Document({
      sections,
      styles: {
        paragraphStyles: [
          {
            id: 'hebrew',
            name: 'Hebrew Text',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              font: this.hebrewFont,
              size: this.fontSize,
              rightToLeft: true
            },
            paragraph: {
              alignment: AlignmentType.RIGHT
            }
          }
        ]
      }
    });
  }

  private createTreatmentReport(
    patient: Patient,
    document: GeneratedDocument,
    options: WordExportOptions
  ): Document {
    const children: (Paragraph | Table)[] = [];

    // Header
    children.push(...this.createReportHeader(document.title));
    
    // Patient info
    children.push(...this.createPatientSummary(patient));
    
    // Treatment content
    children.push(...this.createTreatmentContent(document));
    
    // Signature
    if (options.includeSignatureSection !== false) {
      children.push(...this.createSignatureSection(options));
    }

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children
      }]
    });
  }

  private createDocumentHeader(): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'מסמך פיזיותרפיה',
            font: this.hebrewFont,
            size: this.titleSize,
            bold: true,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `תאריך: ${this.formatHebrewDate(new Date())}`,
            font: this.hebrewFont,
            size: this.fontSize,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 600 }
      })
    ];
  }

  private createReportHeader(title: string): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            font: this.hebrewFont,
            size: this.titleSize,
            bold: true,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    ];
  }

  private createPatientDetailsSection(patient: Patient): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    // Section title
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'פרטי המטופל',
            font: this.hebrewFont,
            size: this.fontSize + 4,
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400, after: 200 }
      })
    );

    // Patient details table
    const patientTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      },
      rows: [
        this.createTableRow('שם מלא:', `${patient.firstName} ${patient.lastName}`),
        this.createTableRow('תעודת זהות:', patient.idNumber),
        this.createTableRow('תאריך לידה:', this.formatHebrewDate(patient.birthDate)),
        this.createTableRow('טלפון:', patient.phone),
        ...(patient.email ? [this.createTableRow('אימייל:', patient.email)] : []),
        this.createTableRow('כתובת:', this.formatAddress(patient.address))
      ]
    });

    elements.push(patientTable);
    return elements;
  }

  private createPatientSummary(patient: Patient): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'פרטי המטופל: ',
            font: this.hebrewFont,
            size: this.fontSize,
            bold: true,
            rightToLeft: true
          }),
          new TextRun({
            text: `${patient.firstName} ${patient.lastName} | ת.ז. ${patient.idNumber}`,
            font: this.hebrewFont,
            size: this.fontSize,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      })
    ];
  }

  private createMedicalHistorySection(medicalHistory: MedicalRecord[]): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'היסטוריה רפואית וטיפולים',
            font: this.hebrewFont,
            size: this.fontSize + 4,
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 600, after: 200 }
      })
    );

    if (medicalHistory.length === 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'אין רישומים רפואיים',
              font: this.hebrewFont,
              size: this.fontSize,
              rightToLeft: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 }
        })
      );
    } else {
      const historyTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        },
        rows: [
          // Header row
          new TableRow({
            children: [
              this.createTableHeaderCell('תאריך', 20),
              this.createTableHeaderCell('אבחנה', 35),
              this.createTableHeaderCell('טיפול', 30),
              this.createTableHeaderCell('הערות', 15)
            ]
          }),
          // Data rows
          ...medicalHistory.map(record => new TableRow({
            children: [
              this.createTableDataCell(this.formatHebrewDate(record.date)),
              this.createTableDataCell(record.diagnosis),
              this.createTableDataCell(record.treatment),
              this.createTableDataCell(record.notes || '-')
            ]
          }))
        ]
      });

      elements.push(historyTable);
    }

    return elements;
  }

  private createTreatmentContent(document: GeneratedDocument): Paragraph[] {
    const elements: Paragraph[] = [];

    // Parse and format the document content
    const contentLines = document.content.split('\n').filter(line => line.trim());

    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'תוכן הטיפול',
            font: this.hebrewFont,
            size: this.fontSize + 4,
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 600, after: 200 }
      })
    );

    contentLines.forEach(line => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: this.hebrewFont,
              size: this.fontSize,
              rightToLeft: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 }
        })
      );
    });

    return elements;
  }

  private createSignatureSection(options: WordExportOptions): Paragraph[] {
    return [
      // Spacer
      new Paragraph({
        children: [new TextRun({ text: '', size: this.fontSize })],
        spacing: { before: 800 }
      }),
      
      // Date and signature line
      new Paragraph({
        children: [
          new TextRun({
            text: 'תאריך: _______________     ',
            font: this.hebrewFont,
            size: this.fontSize,
            rightToLeft: true
          }),
          new TextRun({
            text: 'חתימת הפיזיותרפיסט: _______________',
            font: this.hebrewFont,
            size: this.fontSize,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 300 }
      }),
      
      // Physiotherapist name
      new Paragraph({
        children: [
          new TextRun({
            text: 'שם הפיזיותרפיסט: ',
            font: this.hebrewFont,
            size: this.fontSize,
            bold: true,
            rightToLeft: true
          }),
          new TextRun({
            text: options.physiotherapistName || '_______________',
            font: this.hebrewFont,
            size: this.fontSize,
            rightToLeft: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      }),
      
      // License number
      new Paragraph({
        children: [
          new TextRun({
            text: 'מספר רישיון: ',
            font: this.hebrewFont,
            size: this.fontSize,
            bold: true,
            rightToLeft: true
          }),
          new TextRun({
            text: options.licenseNumber || '_______________',
            font: this.hebrewFont,
            size: this.fontSize
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      })
    ];
  }

  private createTableRow(label: string, value: string): TableRow {
    return new TableRow({
      children: [
        this.createTableHeaderCell(label, 30),
        this.createTableDataCell(value, 70)
      ]
    });
  }

  private createTableHeaderCell(text: string, width?: number): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: this.hebrewFont,
              size: this.fontSize,
              bold: true,
              rightToLeft: true
            })
          ],
          alignment: AlignmentType.RIGHT
        })
      ],
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
  }

  private createTableDataCell(text: string, width?: number): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: this.hebrewFont,
              size: this.fontSize,
              rightToLeft: true
            })
          ],
          alignment: AlignmentType.RIGHT
        })
      ],
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
  }

  private formatHebrewDate(date: Date): string {
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  private formatAddress(address: { street: string; city: string; postalCode: string }): string {
    return `${address.street}, ${address.city} ${address.postalCode}`;
  }

  private generateFileName(patient: Patient): string {
    const date = new Date().toISOString().split('T')[0];
    const name = `${patient.firstName}-${patient.lastName}`.replace(/\s+/g, '-');
    return `${name}-${date}.docx`;
  }

  private generateTreatmentFileName(patient: Patient, document: GeneratedDocument): string {
    const date = new Date().toISOString().split('T')[0];
    const name = `${patient.firstName}-${patient.lastName}`.replace(/\s+/g, '-');
    const title = document.title.replace(/\s+/g, '-');
    return `${name}-${title}-${date}.docx`;
  }
}

// Singleton instance for easy use
export const wordExporter = new PhysioWordExporter();