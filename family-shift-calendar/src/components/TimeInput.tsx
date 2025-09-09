'use client';

import { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  className?: string;
}

export default function TimeInput({ value, onChange, name, required, className }: TimeInputProps) {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  // Parse the time value when it changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h.padStart(2, '0'));
      setMinutes(m.padStart(2, '0'));
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHours = e.target.value;
    setHours(newHours);
    onChange(`${newHours}:${minutes}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinutes = e.target.value;
    setMinutes(newMinutes);
    onChange(`${hours}:${newMinutes}`);
  };

  // Generate hours 00-23
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: hour, label: hour };
  });

  // Generate minutes 00-59
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, '0');
    return { value: minute, label: minute };
  });

  return (
    <div className={`flex gap-1 ${className}`}>
      <select
        value={hours}
        onChange={handleHourChange}
        className="flex-1 rounded-md px-2 py-2 focus:outline-none focus:ring-2 text-center transition-all"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)'
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        required={required}
      >
        {hourOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="flex items-center font-bold" style={{ color: 'var(--text-secondary)' }}>:</span>
      <select
        value={minutes}
        onChange={handleMinuteChange}
        className="flex-1 rounded-md px-2 py-2 focus:outline-none focus:ring-2 text-center transition-all"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)'
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        required={required}
      >
        {minuteOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Hidden input to maintain form compatibility */}
      <input
        type="hidden"
        name={name}
        value={`${hours}:${minutes}`}
      />
    </div>
  );
}