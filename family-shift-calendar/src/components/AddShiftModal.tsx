'use client';

import { useState, useEffect } from 'react';
import TimeInput from './TimeInput';

interface User {
  id: number;
  name: string;
  color: string;
}

interface ShiftTemplate {
  id: number;
  user_id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shiftData: {
    memberName: string;
    memberColor: string;
    title: string;
    startTime: string;
    endTime: string;
  }) => void;
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];

export default function AddShiftModal({ isOpen, onClose, onSave }: AddShiftModalProps) {
  const [mode, setMode] = useState<'quick' | 'create-template'>('quick');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    memberName: '',
    memberColor: '#3B82F6',
    title: '',
    dates: '',
    startTime: '06:00',
    endTime: '14:00',
    templateName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUserId) {
      fetchTemplates(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTemplates = async (userId: number) => {
    setIsLoadingTemplates(true);
    setError(null);
    try {
      const response = await fetch(`/api/shift-templates?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleUserSelect = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setFormData(prev => ({
        ...prev,
        memberName: user.name,
        memberColor: user.color
      }));
    }
  };

  const handleTemplateSelect = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      title: template.name,
      startTime: template.start_time,
      endTime: template.end_time
    }));
  };

  const handleCreateTemplate = async () => {
    if (!selectedUserId || !formData.templateName || !formData.startTime || !formData.endTime) {
      alert('Please fill in all template fields');
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const response = await fetch(`/api/shift-templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.templateName,
            startTime: formData.startTime,
            endTime: formData.endTime
          })
        });

        if (response.ok) {
          await fetchTemplates(selectedUserId);
          setFormData(prev => ({ ...prev, templateName: '' }));
          setEditingTemplate(null);
          alert('Template updated successfully!');
        }
      } else {
        // Create new template
        const response = await fetch('/api/shift-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUserId,
            name: formData.templateName,
            startTime: formData.startTime,
            endTime: formData.endTime
          })
        });

        if (response.ok) {
          await fetchTemplates(selectedUserId);
          setFormData(prev => ({ ...prev, templateName: '' }));
          alert('Template created successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEditTemplate = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setMode('create-template');
    setFormData(prev => ({
      ...prev,
      templateName: template.name,
      startTime: template.start_time,
      endTime: template.end_time
    }));
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shift-templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTemplates(selectedUserId!);
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
        alert('Template deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setFormData(prev => ({ ...prev, templateName: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'quick') {
      if (!formData.dates || !formData.memberName || !selectedTemplate) {
        setError('Please select a user, template, and enter dates');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Parse dates from format "22.9 11.9 20.9" to individual dates
        const dateStrings = formData.dates.trim().split(/\s+/);
        const currentYear = new Date().getFullYear();
        const validDates = dateStrings.filter(d => d.match(/^\d{1,2}\.\d{1,2}$/));

        if (validDates.length === 0) {
          throw new Error('Please enter at least one valid date in format DD.MM');
        }

        // Create shifts for each date
        for (const dateStr of validDates) {
          const [day, month] = dateStr.split('.');
          const isoDateString = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          
          const startDateTime = new Date(`${isoDateString}T${selectedTemplate.start_time}`);
          const endDateTime = new Date(`${isoDateString}T${selectedTemplate.end_time}`);

          await onSave({
            memberName: formData.memberName,
            memberColor: formData.memberColor,
            title: formData.title || selectedTemplate.name,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
          });
        }

        // Reset form
        setFormData({
          memberName: '',
          memberColor: '#3B82F6',
          title: '',
          dates: '',
          startTime: '06:00',
          endTime: '14:00',
          templateName: ''
        });
        setSelectedUserId(null);
        setSelectedTemplate(null);
        setMode('quick');
        
        onClose();
      } catch (error) {
        console.error('Error submitting shifts:', error);
        setError(error.message || 'Failed to add shifts. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-lg mx-4" style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Shift</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => !isSubmitting && (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => !isSubmitting && (e.target.style.color = 'var(--text-secondary)')}
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ 
            background: 'var(--danger)',
            color: 'white',
            border: '1px solid var(--danger-hover)'
          }}>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isSubmitting && (
          <div className="mb-4 p-3 rounded-lg text-center" style={{ 
            background: 'var(--accent-blue)',
            color: 'white'
          }}>
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Adding shifts...</span>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              background: mode === 'quick' ? 'var(--accent-blue)' : 'var(--border)',
              color: mode === 'quick' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Quick Add
          </button>
          <button
            type="button"
            onClick={() => setMode('create-template')}
            className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              background: mode === 'create-template' ? 'var(--accent-purple)' : 'var(--border)',
              color: mode === 'create-template' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Create Template
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Select User
            </label>
            <div className="relative">
              <select
                value={selectedUserId || ''}
                onChange={(e) => handleUserSelect(parseInt(e.target.value))}
                disabled={isLoadingUsers}
                className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
                required
              >
                <option value="">{isLoadingUsers ? 'Loading users...' : 'Select a user...'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {isLoadingUsers && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--accent-blue)' }}></div>
                </div>
              )}
            </div>
          </div>

          {selectedUserId && mode === 'quick' && (
            <>
              {/* Template Selection */}
              {isLoadingTemplates ? (
                <div className="p-4 rounded-lg text-center" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Loading templates...</span>
                  </div>
                </div>
              ) : templates.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Choose Template (Required) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 p-2 rounded border"
                        style={{
                          background: selectedTemplate?.id === template.id ? 'var(--accent-blue)' : 'var(--background)',
                          borderColor: selectedTemplate?.id === template.id ? 'var(--accent-blue)' : 'var(--border)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className="flex-1 text-left transition-colors"
                          style={{
                            color: selectedTemplate?.id === template.id ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs opacity-75">
                            {template.start_time} - {template.end_time}
                          </div>
                        </button>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditTemplate(template)}
                            className="px-2 py-1 text-xs rounded transition-colors"
                            style={{ 
                              backgroundColor: '#374151', 
                              color: '#9CA3AF',
                              border: '1px solid #4B5563'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#4B5563';
                              e.target.style.color = '#E5E7EB';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#374151';
                              e.target.style.color = '#9CA3AF';
                            }}
                            title="Edit template"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-2 py-1 text-xs rounded transition-colors"
                            style={{ 
                              backgroundColor: '#374151', 
                              color: '#9CA3AF',
                              border: '1px solid #4B5563'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#4B5563';
                              e.target.style.color = '#E5E7EB';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#374151';
                              e.target.style.color = '#9CA3AF';
                            }}
                            title="Delete template"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-md" style={{ background: 'var(--warning)', color: 'white' }}>
                  <p className="text-sm">
                    No templates found for this user. Please create a template first by switching to "Create Template" mode.
                  </p>
                </div>
              )}

              {/* Shift Title */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Shift Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Early, Late, Night"
                  className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Dates (Times from selected template)
                </label>
                <input
                  type="text"
                  name="dates"
                  value={formData.dates}
                  onChange={handleInputChange}
                  placeholder="e.g., 22.9 11.9 20.9 (day.month separated by spaces)"
                  className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Enter multiple dates separated by spaces. Year will be current year ({new Date().getFullYear()}).
                </div>
              </div>
            </>
          )}

          {selectedUserId && mode === 'create-template' && (
            <>
              {/* Template Creation/Editing */}
              <div className="mb-2">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleInputChange}
                  placeholder="e.g., Early, Late, Night"
                  className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Start Time
                  </label>
                  <TimeInput
                    value={formData.startTime}
                    onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
                    name="startTime"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    End Time
                  </label>
                  <TimeInput
                    value={formData.endTime}
                    onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                    name="endTime"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 rounded-md font-medium transition-colors"
                    style={{
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      background: 'var(--background)'
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCreateTemplate}
                  className="flex-1 px-4 py-2 text-white rounded-md font-medium transition-colors"
                  style={{ backgroundColor: 'var(--success)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--success-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--success)'}
                >
                  {editingTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {mode === 'quick' && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md font-medium transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  background: 'var(--background)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTemplate || !formData.dates || isSubmitting}
                className="flex-1 px-4 py-2 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: (!selectedTemplate || !formData.dates || isSubmitting) ? 'var(--border)' : 'var(--accent-blue)',
                  cursor: (!selectedTemplate || !formData.dates || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate && formData.dates && !isSubmitting) {
                    e.target.style.backgroundColor = 'var(--accent-blue-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate && formData.dates && !isSubmitting) {
                    e.target.style.backgroundColor = 'var(--accent-blue)';
                  }
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </span>
                ) : (
                  `Add Shift${formData.dates && formData.dates.trim().split(/\s+/).filter(d => d.match(/^\d{1,2}\.\d{1,2}$/)).length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}