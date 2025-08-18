import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  X, 
  Layout, 
  Plus, 
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  CheckSquare,
  Circle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTemplateStore } from '@/store/useTemplateStore';
import type { Template, TemplateField, TemplateCategory, FieldType } from '@/types/template';
import { TEMPLATE_CATEGORIES, FIELD_TYPE_LABELS } from '@/types/template';

const TemplateSchema = z.object({
  name: z.string()
    .min(1, 'שם התבנית נדרש')
    .max(100, 'שם התבנית ארוך מדי'),
  description: z.string()
    .min(1, 'תיאור התבנית נדרש')
    .max(500, 'תיאור התבנית ארוך מדי'),
  category: z.string().min(1, 'קטגוריה נדרשת'),
  isActive: z.boolean(),
  fields: z.array(z.object({
    name: z.string().min(1, 'שם השדה נדרש'),
    label: z.string().min(1, 'תווית השדה נדרשת'),
    type: z.string().min(1, 'סוג השדה נדרש'),
    required: z.boolean(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    options: z.string().optional(), // Will be split by lines
    order: z.number(),
    group: z.string().optional(),
  })).min(1, 'לפחות שדה אחד נדרש'),
});

type TemplateFormData = z.infer<typeof TemplateSchema>;

interface TemplateFormProps {
  template?: Template;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const getFieldTypeIcon = (type: FieldType) => {
  const icons = {
    text: Type,
    textarea: AlignLeft,
    number: Hash,
    date: Calendar,
    time: Calendar,
    datetime: Calendar,
    select: Circle,
    radio: Circle,
    checkbox: CheckSquare,
    'patient-select': Circle,
    signature: Type,
    patient_info: Type,
    rating: Hash,
    'pain-scale': Hash,
    'body-diagram': Type,
    'file-upload': Type,
    divider: Type,
    header: Type
  } as const;
  return icons[type] || Type;
};

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSave,
  onCancel,
  isModal = false
}) => {
  const { addTemplate, updateTemplate, isLoading, error } = useTemplateStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<TemplateFormData>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: template ? {
      name: template.name,
      description: template.description,
      category: template.category,
      isActive: template.isActive,
      fields: template.fields.map(field => ({
        ...field,
        options: field.options?.join('\n') || ''
      }))
    } : {
      name: '',
      description: '',
      category: 'custom',
      isActive: true,
      fields: [{
        name: 'patientName',
        label: 'שם המטופל',
        type: 'patient-select',
        required: true,
        placeholder: '',
        helpText: '',
        options: '',
        order: 1,
        group: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsSubmitting(true);
      
      const templateData = {
        ...data,
        version: template?.version || '1.0',
        fields: data.fields.map((field, index) => ({
          id: template?.fields[index]?.id || crypto.randomUUID(),
          name: field.name,
          label: field.label,
          type: field.type as FieldType,
          required: field.required,
          placeholder: field.placeholder,
          helpText: field.helpText,
          options: field.options ? field.options.split('\n').filter(opt => opt.trim()) : undefined,
          order: field.order,
          group: field.group,
          validation: {} // TODO: Add validation configuration
        })) as TemplateField[],
        content: generateTemplateContent(data.fields), // Generate basic content template
        category: data.category as TemplateCategory
      };

      if (template) {
        await updateTemplate(template.id, templateData);
      } else {
        await addTemplate(templateData);
      }

      onSave?.(templateData as Template);
      if (!template) {
        reset();
      }
    } catch (error) {
      console.error('שגיאה בשמירת התבנית:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTemplateContent = (fields: any[]): string => {
    return fields.map(field => {
      if (field.type === 'header') {
        return `\n## ${field.label}\n`;
      } else if (field.type === 'divider') {
        return '\n---\n';
      } else {
        return `**${field.label}:** {{${field.name}}}`;
      }
    }).join('\n\n');
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const addField = () => {
    append({
      name: `field_${fields.length + 1}`,
      label: 'שדה חדש',
      type: 'text',
      required: false,
      placeholder: '',
      helpText: '',
      options: '',
      order: fields.length + 1,
      group: ''
    });
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-200",
      isModal ? "p-6 max-h-[90vh] overflow-y-auto" : "p-8"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Layout className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {template ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}
            </h2>
            <p className="text-gray-600">
              {template ? 'עדכן את פרטי התבנית והשדות' : 'צור תבנית חדשה למסמכים'}
            </p>
          </div>
        </div>
        {isModal && (
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            פרטים בסיסיים
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם התבנית *
              </label>
              <input
                {...register('name')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="הכניסי שם לתבנית"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה *
              </label>
              <select
                {...register('category')}
                className={cn(
                  "input w-full",
                  errors.category && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              >
                {Object.entries(TEMPLATE_CATEGORIES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור התבנית *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className={cn(
                  "input w-full",
                  errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="תארי במה התבנית עוזרת ומתי כדאי להשתמש בה"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('isActive')}
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                תבנית פעילה (זמינה לשימוש)
              </label>
            </div>
          </div>
        </div>

        {/* Template Fields */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              שדות התבנית
            </h3>
            <button
              type="button"
              onClick={addField}
              className="btn btn-ghost text-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              הוסף שדה
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const FieldIcon = getFieldTypeIcon(field.type as FieldType);
              
              return (
                <div key={field.id} className="card-compact bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="p-2 text-gray-400 cursor-move">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Field Icon */}
                    <div className="p-2 bg-white rounded-lg">
                      <FieldIcon className="h-4 w-4 text-blue-600" />
                    </div>

                    {/* Field Configuration */}
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          שם השדה
                        </label>
                        <input
                          {...register(`fields.${index}.name`)}
                          type="text"
                          className="input text-sm"
                          placeholder="fieldName"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          תווית השדה
                        </label>
                        <input
                          {...register(`fields.${index}.label`)}
                          type="text"
                          className="input text-sm"
                          placeholder="תווית בעברית"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          סוג השדה
                        </label>
                        <select
                          {...register(`fields.${index}.type`)}
                          className="input text-sm"
                        >
                          {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          טקסט עזרה
                        </label>
                        <input
                          {...register(`fields.${index}.placeholder`)}
                          type="text"
                          className="input text-sm"
                          placeholder="הוראות למילוי"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          קבוצה
                        </label>
                        <input
                          {...register(`fields.${index}.group`)}
                          type="text"
                          className="input text-sm"
                          placeholder="שם הקבוצה"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <label className="flex items-center gap-2">
                          <input
                            {...register(`fields.${index}.required`)}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">שדה חובה</span>
                        </label>
                      </div>

                      {/* Options for select/radio fields */}
                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            אפשרויות (שורה אחת לכל אפשרות)
                          </label>
                          <textarea
                            {...register(`fields.${index}.options`)}
                            rows={3}
                            className="input text-sm"
                            placeholder="אפשרות 1&#10;אפשרות 2&#10;אפשרות 3"
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove Field Button */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {errors.fields && (
            <p className="mt-2 text-sm text-red-600">{errors.fields.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            ביטול
          </button>
          
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={isSubmitting || isLoading}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'שומר...' : (template ? 'עדכן תבנית' : 'צור תבנית')}
          </button>
        </div>
      </form>
    </div>
  );
};