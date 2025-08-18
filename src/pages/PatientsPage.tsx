import React, { useState, useMemo, useEffect } from 'react';
import { Search, Users, UserPlus, Filter, Calendar } from 'lucide-react';
// import { cn } from '@/utils/cn';
import { usePatientStore } from '@/store/usePatientStore';
import { PatientCard } from '@/components/Patients/PatientCard';
import { PatientForm } from '@/components/Patients/PatientForm';
import { DocumentCreationModal } from '@/components/Documents/DocumentCreationModal';
import type { Patient } from '@/types';

interface PatientsPageProps {
  initialAction?: 'new';
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ initialAction }) => {
  const {
    patients,
    searchTerm,
    setSearchTerm,
    getFilteredPatients,
    deletePatient,
    cleanupCorruptedData,
    initializeDefaultPatients,
    error,
    clearError
  } = usePatientStore();

  const [showAddForm, setShowAddForm] = useState(initialAction === 'new');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'thisWeek'>('all');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedPatientForDocument, setSelectedPatientForDocument] = useState<Patient | null>(null);

  // Initialize and cleanup data on first load
  useEffect(() => {
    // First cleanup any corrupted data
    cleanupCorruptedData();
    
    // Then initialize default patients if none exist
    if (patients.length === 0) {
      initializeDefaultPatients();
    }
  }, [patients.length, cleanupCorruptedData, initializeDefaultPatients]);

  const filteredPatients = useMemo(() => {
    const result = getFilteredPatients();
    
    switch (filterType) {
      case 'recent': {
        return result.filter(patient => 
          patient.medicalHistory?.length > 0
        );
      }
      case 'thisWeek': {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return result.filter(patient => 
          patient.medicalHistory?.some(record => {
            const recordDate = typeof record.date === 'string' ? new Date(record.date) : record.date;
            return !isNaN(recordDate.getTime()) && recordDate > weekAgo;
          })
        );
      }
      default:
        return result;
    }
  }, [patients, searchTerm, filterType]);

  const handleAddPatient = () => {
    setShowAddForm(true);
    setEditingPatient(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowAddForm(true);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את ${patient.firstName} ${patient.lastName}?`)) {
      await deletePatient(patient.id);
    }
  };

  const handleFormSave = () => {
    setShowAddForm(false);
    setEditingPatient(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingPatient(null);
  };

  const handleViewDocuments = (patient: Patient) => {
    setSelectedPatientForDocument(patient);
    setShowDocumentModal(true);
  };

  const handleDocumentModalClose = () => {
    setShowDocumentModal(false);
    setSelectedPatientForDocument(null);
  };

  const handleDocumentCreated = (documentId: string) => {
    // Navigate to the document editor or handle success
    console.log('Document created with ID:', documentId);
    handleDocumentModalClose();
  };

  const totalPatients = patients.length;
  const recentPatients = patients.filter(p => p.medicalHistory?.length > 0).length;
  const thisWeekPatients = patients.filter(p => 
    p.medicalHistory?.some(record => {
      const recordDate = typeof record.date === 'string' ? new Date(record.date) : record.date;
      return !isNaN(recordDate.getTime()) && recordDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    })
  ).length;

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <PatientForm
          patient={editingPatient || undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            ניהול מטופלים
          </h1>
          <p className="text-gray-600 mt-2">
            נהלי את רשימת המטופלים שלך והוסיפי מטופלים חדשים
          </p>
        </div>
        <button
          onClick={handleAddPatient}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          הוספת מטופל חדש
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">סה״כ מטופלים</p>
              <p className="text-3xl font-bold text-blue-800">{totalPatients}</p>
              <p className="text-xs text-blue-600 mt-1">רשומים במערכת</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Users className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">עם מסמכים</p>
              <p className="text-3xl font-bold text-green-800">{recentPatients}</p>
              <p className="text-xs text-green-600 mt-1">יש תיעוד טיפול</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <Calendar className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">טיפולים השבוע</p>
              <p className="text-3xl font-bold text-purple-800">{thisWeekPatients}</p>
              <p className="text-xs text-purple-600 mt-1">טופלו השבוע</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <UserPlus className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="חפש מטופל לפי שם, תעודת זהות או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pr-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="input min-w-[150px]"
          >
            <option value="all">כל המטופלים</option>
            <option value="recent">עם תיעוד</option>
            <option value="thisWeek">טופלו השבוע</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              מציג {filteredPatients.length} מתוך {totalPatients} מטופלים
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                onViewDocuments={handleViewDocuments}
              />
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              {searchTerm ? (
                <Search className="h-12 w-12 text-gray-400" />
              ) : (
                <Users className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'לא נמצאו מטופלים' : 'אין מטופלים עדיין'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `לא נמצאו תוצאות עבור "${searchTerm}"`
                : 'התחילי בהוספת המטופל הראשון שלך למערכת'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddPatient}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <UserPlus className="h-5 w-5" />
                הוסיפי מטופל ראשון
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document Creation Modal */}
      <DocumentCreationModal
        isOpen={showDocumentModal}
        onClose={handleDocumentModalClose}
        onDocumentCreated={handleDocumentCreated}
        preSelectedPatient={selectedPatientForDocument || undefined}
      />
    </div>
  );
};