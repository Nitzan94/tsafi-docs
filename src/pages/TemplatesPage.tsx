import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Layout, Filter, FileText, TrendingUp, Layers } from 'lucide-react';
// import { cn } from '@/utils/cn';
import { useTemplateStore } from '@/store/useTemplateStore';
import { TemplateCard } from '@/components/Templates/TemplateCard';
import { TemplateForm } from '@/components/Templates/TemplateForm';
import type { Template, TemplateCategory } from '@/types/template';
import { TEMPLATE_CATEGORIES } from '@/types/template';

export const TemplatesPage: React.FC = () => {
  const {
    templates,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    getFilteredTemplates,
    deleteTemplate,
    duplicateTemplate,
    initializeDefaultTemplates,
    cleanupCorruptedData,
    error,
    clearError,
    isLoading
  } = useTemplateStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Initialize and cleanup data on first load
  useEffect(() => {
    // First cleanup any corrupted data
    cleanupCorruptedData();
    
    // Then initialize default templates if none exist
    if (templates.length === 0) {
      initializeDefaultTemplates();
    }
  }, [templates.length, initializeDefaultTemplates, cleanupCorruptedData]);

  const filteredTemplates = useMemo(() => {
    return getFilteredTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const handleAddTemplate = () => {
    setShowAddForm(true);
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowAddForm(true);
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את התבנית "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    const newName = prompt('הכניסי שם לתבנית החדשה:', `העתק של ${template.name}`);
    if (newName && newName.trim()) {
      await duplicateTemplate(template.id, newName.trim());
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    // TODO: Implement template preview modal
    console.log('Preview template:', template.name);
  };

  const handleUseTemplate = (template: Template) => {
    // TODO: Navigate to document creation with this template
    console.log('Use template:', template.name);
  };

  const handleFormSave = () => {
    setShowAddForm(false);
    setEditingTemplate(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingTemplate(null);
  };

  // Calculate statistics
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.isActive).length;
  const mostUsedTemplate = templates.reduce((prev, current) => 
    (prev.usageCount > current.usageCount) ? prev : current, templates[0]);
  const categoryCounts = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <TemplateForm
          template={editingTemplate || undefined}
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
              <Layout className="h-8 w-8 text-blue-600" />
            </div>
            ניהול תבניות מסמכים
          </h1>
          <p className="text-gray-600 mt-2">
            נהלי את תבניות המסמכים שלך וצרי תבניות חדשות לטיפולים שונים
          </p>
        </div>
        <button
          onClick={handleAddTemplate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          יצירת תבנית חדשה
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
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">סה״כ תבניות</p>
              <p className="text-3xl font-bold text-blue-800">{totalTemplates}</p>
              <p className="text-xs text-blue-600 mt-1">במערכת</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Layout className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">תבניות פעילות</p>
              <p className="text-3xl font-bold text-green-800">{activeTemplates}</p>
              <p className="text-xs text-green-600 mt-1">זמינות לשימוש</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <FileText className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">הכי פופולרית</p>
              <p className="text-lg font-bold text-purple-800 truncate">
                {mostUsedTemplate?.name || 'אין נתונים'}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {mostUsedTemplate?.usageCount || 0} שימושים
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="card-compact bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">קטגוריות</p>
              <p className="text-3xl font-bold text-orange-800">
                {Object.keys(categoryCounts).length}
              </p>
              <p className="text-xs text-orange-600 mt-1">סוגים שונים</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-xl">
              <Layers className="h-8 w-8 text-orange-700" />
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
            placeholder="חפש תבנית לפי שם, תיאור או קטגוריה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pr-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
            className="input min-w-[180px]"
          >
            <option value="all">כל הקטגוריות</option>
            {Object.entries(TEMPLATE_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({categoryCounts[value] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Layout className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600">טוען תבניות...</p>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && filteredTemplates.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              מציג {filteredTemplates.length} מתוך {totalTemplates} תבניות
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onPreview={handlePreviewTemplate}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </>
      ) : !isLoading ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              {searchTerm ? (
                <Search className="h-12 w-12 text-gray-400" />
              ) : (
                <Layout className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'לא נמצאו תבניות' : 'אין תבניות עדיין'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `לא נמצאו תוצאות עבור "${searchTerm}"`
                : 'התחילי ביצירת התבנית הראשונה שלך למסמכים'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddTemplate}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                צרי תבנית ראשונה
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Category Quick Access */}
      {!searchTerm && selectedCategory === 'all' && filteredTemplates.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">גישה מהירה לפי קטגוריות</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TEMPLATE_CATEGORIES).map(([category, label]) => {
              const count = categoryCounts[category] || 0;
              if (count === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as TemplateCategory)}
                  className="card-compact text-right hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">
                        {label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {count} תבניות
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                      <Layout className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};