'use client';

import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { useState, useEffect } from 'react';
import AddShiftModal from './AddShiftModal';
import EditShiftModal from './EditShiftModal';
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
  const [selectedShift, setSelectedShift] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchShifts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/shifts');
      const data = await response.json();
      
      const formattedEvents = data.map((shift: any) => ({
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
    }
  };

  const handleAddShift = async (shiftData: {
    memberName: string;
    memberColor: string;
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      // First, check if user exists or create new user
      let userId = await getOrCreateUser(shiftData.memberName, shiftData.memberColor);
      
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

      if (response.ok) {
        fetchShifts(); // Refresh the calendar
      }
    } catch (error) {
      console.error('Error adding shift:', error);
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

  const handleEditShift = async (shiftData: any) => {
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

      if (response.ok) {
        fetchShifts(); // Refresh the calendar
      }
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchShifts(); // Refresh the calendar
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Schedule Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium text-sm"
            >
              + Add Shift
            </button>
            <div className="flex gap-1 ml-4">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  view === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  view === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  view === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: '600px' }}>
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
            style={{ height: '100%' }}
            popup
            showMultiDayTimes
          />
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
    </>
  );
}