import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, User, Phone, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { validateIsraeliId } from '@/utils/hebrew';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient } from '@/types';

const PatientSchema = z.object({
  firstName: z.string()
    .min(1, 'שם פרטי נדרש')
    .max(50, 'שם פרטי ארוך מדי'),
  lastName: z.string()
    .min(1, 'שם משפחה נדרש')
    .max(50, 'שם משפחה ארוך מדי'),
  idNumber: z.string()
    .regex(/^\d{9}$/, 'תעודת זהות חייבת להכיל 9 ספרות')
    .refine(validateIsraeliId, 'תעודת זהות לא תקינה'),
  phone: z.string()
    .regex(/^05\d-?\d{7}$/, 'פורמט טלפון לא תקין (05X-XXXXXXX)'),
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .optional()
    .or(z.literal('')),
  birthDate: z.string()
    .min(1, 'תאריך לידה נדרש'),
  address: z.object({
    street: z.string().min(1, 'כתובת נדרשת'),
    city: z.string().min(1, 'עיר נדרשת'),
    postalCode: z.string().optional(),
    country: z.string().default('ישראל'),
  }),
});

type PatientFormData = z.infer<typeof PatientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSave?: (patient: Patient) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSave,
  onCancel,
  isModal = false
}) => {
  const { addPatient, updatePatient, isLoading, error } = usePatientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: patient ? {
      firstName: patient.firstName,
      lastName: patient.lastName,
      idNumber: patient.idNumber,
      phone: patient.phone,
      email: patient.email || '',
      birthDate: patient.birthDate.toISOString().split('T')[0],
      address: patient.address,
    } : {
      address: {
        country: 'ישראל',
        street: '',
        city: '',
        postalCode: '',
      }
    }
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true);
      
      const patientData = {
        ...data,
        email: data.email || undefined,
        birthDate: new Date(data.birthDate),
        medicalHistory: patient?.medicalHistory || [],
        address: {
          ...data.address,
          postalCode: data.address.postalCode || ''
        }
      };

      if (patient) {
        await updatePatient(patient.id, patientData);
      } else {
        await addPatient(patientData);
      }

      onSave?.(patientData as Patient);
      if (!patient) {
        reset();
      }
    } catch (error) {
      console.error('שגיאה בשמירת המטופל:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-200",
      isModal ? "p-6" : "p-8"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {patient ? 'עריכת פרטי מטופל' : 'הוספת מטופל חדש'}
            </h2>
            <p className="text-gray-600">
              {patient ? 'עדכן את פרטי המטופל במערכת' : 'הזן את פרטי המטופל החדש'}
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
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            פרטים אישיים
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם פרטי *
              </label>
              <input
                {...register('firstName')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.firstName && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="הכניסי שם פרטי"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם משפחה *
              </label>
              <input
                {...register('lastName')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.lastName && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="הכניסי שם משפחה"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תעודת זהות *
              </label>
              <input
                {...register('idNumber')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.idNumber && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="123456789"
                maxLength={9}
              />
              {errors.idNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.idNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תאריך לידה *
              </label>
              <input
                {...register('birthDate')}
                type="date"
                className={cn(
                  "input w-full",
                  errors.birthDate && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            פרטי קשר
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טלפון *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className={cn(
                  "input w-full",
                  errors.phone && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="050-1234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אימייל (אופציונלי)
              </label>
              <input
                {...register('email')}
                type="email"
                className={cn(
                  "input w-full",
                  errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="patient@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            כתובת
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                רחוב *
              </label>
              <input
                {...register('address.street')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.address?.street && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="רחוב הרצל 123"
              />
              {errors.address?.street && (
                <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עיר *
              </label>
              <input
                {...register('address.city')}
                type="text"
                className={cn(
                  "input w-full",
                  errors.address?.city && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="תל אביב"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מיקוד (אופציונלי)
              </label>
              <input
                {...register('address.postalCode')}
                type="text"
                className="input w-full"
                placeholder="1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מדינה
              </label>
              <input
                {...register('address.country')}
                type="text"
                className="input w-full"
                readOnly
              />
            </div>
          </div>
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
            {isSubmitting ? 'שומר...' : (patient ? 'עדכן מטופל' : 'הוסף מטופל')}
          </button>
        </div>
      </form>
    </div>
  );
};