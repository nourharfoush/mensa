import React from 'react';

function TimePicker({ value, onChange, name }) {
  // Parse time string (HH:mm) to get hours and minutes
  const [hours, minutes] = value ? value.split(':') : ['00', '00'];
  
  // Generate hours (0-23)
  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  // Generate minutes (0-59)
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleHourChange = (newHour) => {
    const newTime = `${newHour}:${minutes}`;
    onChange({ target: { name, value: newTime } });
  };

  const handleMinuteChange = (newMinute) => {
    const newTime = `${hours}:${newMinute}`;
    onChange({ target: { name, value: newTime } });
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>ساعات</label>
        <select
          value={hours}
          onChange={(e) => handleHourChange(e.target.value)}
          className="form-select"
          style={{ width: '100%' }}
        >
          {hoursList.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
      <span style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '15px' }}>:</span>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>دقائق</label>
        <select
          value={minutes}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="form-select"
          style={{ width: '100%' }}
        >
          {minutesList.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TimePicker;
