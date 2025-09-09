'use client';

import { useState } from 'react';
import TimeInput from './TimeInput';

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
  const [formData, setFormData] = useState({
    memberName: '',
    memberColor: '#3B82F6',
    title: '',
    startDate: '',
    startTime: '',
    endTime: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

    onSave({
      memberName: formData.memberName,
      memberColor: formData.memberColor,
      title: formData.title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    });

    // Reset form
    setFormData({
      memberName: '',
      memberColor: '#3B82F6',
      title: '',
      startDate: '',
      startTime: '',
      endTime: ''
    });
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md mx-4" style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Shift</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Your Name
            </label>
            <input
              type="text"
              name="memberName"
              value={formData.memberName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                focusRingColor: 'var(--accent-blue)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Choose Your Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, memberColor: color.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.memberColor === color.value 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.memberColor }}
              ></div>
              Selected: {colorOptions.find(c => c.value === formData.memberColor)?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Shift Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Morning Shift, Evening Shift"
              className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                colorScheme: 'dark'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Start Time (24h)
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
                End Time (24h)
              </label>
              <TimeInput
                value={formData.endTime}
                onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                name="endTime"
                required
              />
            </div>
          </div>

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
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--border)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--background)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-md font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-blue)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-blue-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-blue)'}
            >
              Add Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}