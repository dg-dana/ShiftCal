'use client';

import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { useState, useEffect } from 'react';
import AddShiftModal from './AddShiftModal';
import EditShiftModal from './EditShiftModal';
import UserManagementModal from './UserManagementModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  user_name: string;
  user_color: string;
}

interface User {
  id: number;
  name: string;
  color: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<CalendarEvent | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchUsers(), fetchShifts()]);
    } catch (error) {
      setError('Failed to load calendar data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      throw error;
    }
  };

  const fetchShifts = async () => {
    setIsLoadingShifts(true);
    try {
      const response = await fetch('/api/shifts');
      if (!response.ok) {
        throw new Error(`Failed to fetch shifts: ${response.status}`);
      }
      const data = await response.json();
      
      const formattedEvents = data.map((shift: {
        id: number;
        user_name: string;
        title: string;
        start_time: string;
        end_time: string;
        user_color: string;
      }) => ({
        id: shift.id,
        title: `${shift.user_name} - ${shift.title}`,
        start: new Date(shift.start_time),
        end: new Date(shift.end_time),
        user_name: shift.user_name,
        user_color: shift.user_color
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to load shifts');
      throw error;
    } finally {
      setIsLoadingShifts(false);
    }
  };

  const handleAddShift = async (shiftData: {
    memberName: string;
    memberColor: string;
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    setError(null);
    try {
      // First, check if user exists or create new user
      const userId = await getOrCreateUser(shiftData.memberName, shiftData.memberColor);
      
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: shiftData.title,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add shift: ${response.status}`);
      }

      await fetchShifts(); // Refresh the calendar
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding shift:', error);
      setError('Failed to add shift. Please try again.');
    }
  };

  const getOrCreateUser = async (name: string, color: string): Promise<number> => {
    try {
      // Check if user exists
      const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
      if (existingUser) {
        return existingUser.id;
      }

      // Create new user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers(); // Refresh users list
        return result.id;
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error getting or creating user:', error);
      throw error;
    }
  };

  const handleEditShift = async (shiftData: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    setError(null);
    try {
      const response = await fetch(`/api/shifts/${shiftData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shiftData.title,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update shift: ${response.status}`);
      }

      await fetchShifts(); // Refresh the calendar
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      setError('Failed to update shift. Please try again.');
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    setError(null);
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete shift: ${response.status}`);
      }

      await fetchShifts(); // Refresh the calendar
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
      setError('Failed to delete shift. Please try again.');
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedShift(event);
    setIsEditModalOpen(true);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.user_color,
        borderColor: event.user_color,
        color: 'white'
      }
    };
  };

  return (
    <>
      <div className="rounded-lg shadow-lg p-6" style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border)' 
      }}>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg" style={{ 
            background: 'var(--danger)',
            color: 'white',
            border: '1px solid var(--danger-hover)'
          }}>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={loadInitialData}
                className="ml-auto px-3 py-1 rounded text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="mb-4 p-4 rounded-lg text-center" style={{ 
            background: 'var(--accent-blue)',
            color: 'white'
          }}>
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Loading calendar...</span>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Schedule Overview
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setDate(newDate);
                }}
                className="text-2xl font-bold transition-all transform"
                style={{ 
                  color: 'var(--text-accent)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--accent-cyan)';
                  e.target.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-accent)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ‹
              </button>
              <div className="text-2xl font-bold" style={{ 
                color: 'var(--text-accent)',
                background: 'linear-gradient(135deg, var(--text-accent), var(--accent-cyan))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                minWidth: '300px',
                textAlign: 'center'
              }}>
                {view === 'month' && date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {view === 'week' && `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {view === 'day' && date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setDate(newDate);
                }}
                className="text-2xl font-bold transition-all transform"
                style={{ 
                  color: 'var(--text-accent)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--accent-cyan)';
                  e.target.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-accent)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ›
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsUserManagementOpen(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md font-medium text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--accent-blue)', 
                borderColor: 'var(--accent-blue)' 
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'var(--accent-blue-hover)')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = 'var(--accent-blue)')}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md font-medium text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--success)', 
                borderColor: 'var(--success)' 
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'var(--success-hover)')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = 'var(--success)')}
            >
              {isLoadingShifts ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </span>
              ) : (
                '+ Add Shift'
              )}
            </button>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setView('month')}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all transform"
                style={{
                  background: view === 'month' 
                    ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                    : 'linear-gradient(135deg, var(--border), var(--border-hover))',
                  color: view === 'month' ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${view === 'month' ? 'var(--accent-purple)' : 'var(--border-accent)'}`,
                  boxShadow: view === 'month' ? '0 4px 12px rgba(124, 58, 237, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transform: view === 'month' ? 'scale(1.05)' : 'scale(1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (view !== 'month') {
                    e.target.style.background = 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.02) translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'month') {
                    e.target.style.background = 'linear-gradient(135deg, var(--border), var(--border-hover))';
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all transform"
                style={{
                  background: view === 'week' 
                    ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' 
                    : 'linear-gradient(135deg, var(--border), var(--border-hover))',
                  color: view === 'week' ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${view === 'week' ? 'var(--accent-cyan)' : 'var(--border-accent)'}`,
                  boxShadow: view === 'week' ? '0 4px 12px rgba(8, 145, 178, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transform: view === 'week' ? 'scale(1.05)' : 'scale(1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (view !== 'week') {
                    e.target.style.background = 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.02) translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'week') {
                    e.target.style.background = 'linear-gradient(135deg, var(--border), var(--border-hover))';
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all transform"
                style={{
                  background: view === 'day' 
                    ? 'linear-gradient(135deg, var(--warning), var(--danger))' 
                    : 'linear-gradient(135deg, var(--border), var(--border-hover))',
                  color: view === 'day' ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${view === 'day' ? 'var(--warning)' : 'var(--border-accent)'}`,
                  boxShadow: view === 'day' ? '0 4px 12px rgba(217, 119, 6, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transform: view === 'day' ? 'scale(1.05)' : 'scale(1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (view !== 'day') {
                    e.target.style.background = 'linear-gradient(135deg, var(--success), var(--accent-cyan))';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.02) translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'day') {
                    e.target.style.background = 'linear-gradient(135deg, var(--border), var(--border-hover))';
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: '600px', position: 'relative' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%', opacity: isLoading || isLoadingShifts ? 0.5 : 1 }}
            popup
            showMultiDayTimes
            toolbar={false}
          />
          
          {/* Calendar Loading Overlay */}
          {(isLoading || isLoadingShifts) && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(2px)',
                borderRadius: '8px'
              }}
            >
              <div 
                className="px-6 py-4 rounded-lg flex items-center gap-3"
                style={{ 
                  background: 'var(--card-bg)',
                  border: '2px solid var(--accent-blue)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--accent-blue)' }}></div>
                <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                  {isLoading ? 'Loading calendar...' : 'Refreshing shifts...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddShiftModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddShift}
      />

      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditShift}
        onDelete={handleDeleteShift}
        shift={selectedShift}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        onUsersChanged={fetchUsers}
      />
    </>
  );
}