'use client';

import { useState, useEffect } from 'react';
import TimeInput from './TimeInput';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shiftData: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
  }) => void;
  onDelete: (id: number) => void;
  shift: {
    id: number;
    title: string;
    start: Date;
    end: Date;
    user_name: string;
    user_color: string;
  } | null;
}

export default function EditShiftModal({ isOpen, onClose, onSave, onDelete, shift }: EditShiftModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    if (shift) {
      const startDate = new Date(shift.start);
      const endDate = new Date(shift.end);
      
      // Format date as dd.mm.yyyy
      const day = startDate.getDate().toString().padStart(2, '0');
      const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
      const year = startDate.getFullYear();
      
      setFormData({
        title: shift.title,
        startDate: `${day}.${month}.${year}`,
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5)
      });
    }
  }, [shift]);

  if (!isOpen || !shift) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert dd.mm.yyyy to yyyy-mm-dd format for Date constructor
    const [day, month, year] = formData.startDate.split('.');
    const isoDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    const startDateTime = new Date(`${isoDateString}T${formData.startTime}`);
    const endDateTime = new Date(`${isoDateString}T${formData.endTime}`);

    onSave({
      id: shift.id,
      title: formData.title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      onDelete(shift.id);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Shift</h2>
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

        <div className="mb-4 p-3 rounded-md" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: shift.user_color }}
            ></div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {shift.user_name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Shift Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
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
              type="text"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              placeholder="dd.mm.yyyy"
              pattern="\d{2}\.\d{2}\.\d{4}"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-white rounded-md font-medium transition-colors"
              style={{ backgroundColor: 'var(--danger)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--danger-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--danger)'}
            >
              Delete
            </button>
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}