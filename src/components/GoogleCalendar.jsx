// src/components/GoogleCalendar.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = 'spxstudent.org_ndugje9uqtb8hqdm9s2qkpi2k4@group.calendar.google.com';

const GoogleCalendar = () => {
  const { currentTheme } = useTheme();
  const [events, setEvents] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
          {
            params: {
              key: API_KEY,
              timeMin: new Date().toISOString(),
              maxResults: 10,
              singleEvents: true,
              orderBy: 'startTime',
            },
          }
        );
        
        const groupedEvents = response.data.items.reduce((acc, event) => {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          const localDate = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
          const dateString = localDate.toDateString();
          
          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(event);
          return acc;
        }, {});

        setEvents(groupedEvents);
      } catch (error) {
        console.error('Error fetching events:', error.response?.data || error.message);
        setError(`Failed to fetch events: ${error.response?.data?.error?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateTimeString) => {
    const options = { hour: 'numeric', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleTimeString(undefined, options);
  };

  return (
    <div className={`${currentTheme.main} rounded-lg shadow-lg w-full border-2 ${currentTheme.border} flex flex-col h-full`}>
      <div className="p-2 flex flex-col h-full">
        <h2 className={`text-sm font-bold ${currentTheme.text} mb-1`}>Upcoming Events</h2>
        <div className="overflow-y-auto flex-grow text-xs">
          {loading ? (
            <div className={`${currentTheme.text} animate-pulse`}>Loading events...</div>
          ) : error ? (
            <div className={`${currentTheme.text} text-red-500`}>Error: {error}</div>
          ) : Object.keys(events).length === 0 ? (
            <div className={currentTheme.text}>No upcoming events</div>
          ) : (
            Object.entries(events).map(([date, dayEvents]) => (
              <div key={date} className="mb-1">
                <h3 className={`text-xs font-semibold ${currentTheme.text}`}>{formatDate(date)}</h3>
                <ul className="space-y-0.5">
                  {dayEvents.map((event) => (
                    <li key={event.id} className={`${currentTheme.accent} p-0.5 rounded shadow`}>
                      <div className={`font-semibold ${currentTheme.text}`}>{event.summary}</div>
                      {event.start.dateTime && (
                        <div className={`${currentTheme.text} opacity-80`}>
                          {formatTime(event.start.dateTime)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendar;
