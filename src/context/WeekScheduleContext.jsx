import React, { createContext, useState, useContext, useCallback } from 'react';

const WeekScheduleContext = createContext();

export const useWeekSchedule = () => useContext(WeekScheduleContext);

export const WeekScheduleProvider = ({ children }) => {
  const [weekSchedule, setWeekSchedule] = useState({});

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/schedule');
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      setWeekSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, []);

  return (
    <WeekScheduleContext.Provider value={{ weekSchedule, setWeekSchedule, fetchSchedule, fetchLeaderboard }}>
      {children}
    </WeekScheduleContext.Provider>
  );
};
