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
      
      setFormData({
        title: shift.title,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5)
      });
    }
  }, [shift]);

  if (!isOpen || !shift) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Shift</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: shift.user_color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {shift.user_name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}