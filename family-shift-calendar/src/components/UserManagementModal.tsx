'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  color: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersChanged: () => void;
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
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Cyan', value: '#06B6D4' },
];

export default function UserManagementModal({ isOpen, onClose, onUsersChanged }: UserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchUsers();
        onUsersChanged();
        setFormData({ name: '', color: '#3B82F6' });
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      color: user.color
    });
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their shifts and templates.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchUsers();
        onUsersChanged();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: '', color: '#3B82F6' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md mx-4" style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Manage Users
          </h2>
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

        {/* Add/Edit User Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user name"
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
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-white scale-110' 
                      : 'border-gray-500 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {editingUser && (
              <button
                type="button"
                onClick={handleCancel}
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
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-md font-medium transition-colors"
              style={{ backgroundColor: 'var(--success)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--success-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--success)'}
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>

        {/* Users List */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Existing Users
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map(user => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-md"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <span style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-2 py-1 text-xs rounded transition-colors"
                    style={{ 
                      backgroundColor: 'var(--accent-blue)', 
                      color: 'white' 
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-blue-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-blue)'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-2 py-1 text-xs rounded transition-colors"
                    style={{ 
                      backgroundColor: 'var(--danger)', 
                      color: 'white' 
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--danger-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--danger)'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                No users found. Add your first user above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}