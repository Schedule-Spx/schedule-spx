import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const Schedule = ({ weekSchedule }) => {
  const { currentTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const daySchedule = weekSchedule[currentDay] || [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setLoading(false);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeString) => {
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours, 10);
    
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  const isActivePeriod = (start, end) => {
    const now = currentTime;
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    return now >= startTime && now < endTime;
  };

  const parseTime = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours, 10), parseInt(minutes, 10));
  };

  return (
    <div className={`${currentTheme.main} rounded-lg shadow-lg w-full border-2 ${currentTheme.border}`}>
      <div className="p-5">
        <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>{currentDay}'s Schedule</h2>
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {loading ? (
            <div className={`${currentTheme.text} animate-pulse`}>Loading schedule...</div>
          ) : daySchedule.length > 0 ? (
            daySchedule.map((period, index) => {
              const [name, time] = period.split(' - ');
              const [start, end] = time.split('-');
              const active = isActivePeriod(start.trim(), end.trim());
              return (
                <div 
                  key={index} 
                  className={`
                    relative flex justify-between items-center p-2 rounded-lg
                    ${active ? `${currentTheme.accent}` : `${currentTheme.main} bg-opacity-50`}
                    transition-all duration-300 ease-in-out
                    animate-fadeIn
                  `}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div 
                    className={`
                      absolute inset-0 rounded-lg 
                      ${active ? 'animate-highlightFadeIn' : ''}
                    `}
                    style={{
                      animationDelay: `${(index * 100) + 500}ms`,
                      animationDuration: '1.5s',
                    }}
                  ></div>
                  <span className={`font-medium relative z-10 ${currentTheme.text}`}>{name}</span>
                  <span className={`relative z-10 ${currentTheme.text} ${active ? '' : 'opacity-80'}`}>
                    {formatTime(start)} - {formatTime(end)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className={`${currentTheme.text} animate-fadeIn`}>No schedule available for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
