// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { useTheme } from './ThemeContext';
import DayHeader from './DayHeader';
import GoogleCalendar from './components/GoogleCalendar';
import PeriodProgress from './PeriodProgress';
import PeriodTitleUpdater from './PeriodTitleUpdater';
import Schedule from './Schedule';
import NavBar from './NavBar';
import Admin from './Admin';
import Account from './Account';
import About from './About';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import AdComponent from './AdComponent';
import AgreementPopup from './components/AgreementPopup';

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [socket, setSocket] = useState(null);
  const [showAgreement, setShowAgreement] = useState(false);

  const handleScheduleUpdate = useCallback((newSchedule) => {
    setWeekSchedule(newSchedule);
    // Force a page refresh to ensure all components update
    window.location.reload();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedExpiry = localStorage.getItem('sessionExpiry');
    if (savedUser && savedExpiry && new Date().getTime() < parseInt(savedExpiry)) {
      setUser(JSON.parse(savedUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }

    const hasAgreed = localStorage.getItem('agreedToTerms');
    if (!hasAgreed) {
      setShowAgreement(true);
    }

    // Set up WebSocket connection
    const ws = new WebSocket('wss://schedule-api.devs4u.workers.dev');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'scheduleUpdate') {
        handleScheduleUpdate(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a short delay
      setTimeout(() => {
        setSocket(new WebSocket('wss://schedule-api.devs4u.workers.dev'));
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [handleScheduleUpdate]);

  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('sessionExpiry', expiry.toString());
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }
  };

  const handleAgree = () => {
    localStorage.setItem('agreedToTerms', 'true');
    setShowAgreement(false);
  };

  const isAdminPage = location.pathname === '/admin';

  return (
    <div className={`App ${theme} flex flex-col min-h-screen`}>
      <NavBar user={user} setUser={updateUser} />
      <PeriodTitleUpdater />
      {showAgreement && <AgreementPopup onAgree={handleAgree} />}
      <Routes>
        <Route path="/admin" element={<Admin user={user} weekSchedule={weekSchedule} setWeekSchedule={setWeekSchedule} socket={socket} />} />
        <Route path="/account" element={<Account user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route
          path="/"
          element={
            <main className="flex-grow p-4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <DayHeader />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Schedule weekSchedule={weekSchedule} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <GoogleCalendar />
                </div>
              </div>
              <div className="w-full mb-4">
                <PeriodProgress weekSchedule={weekSchedule} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AdComponent adSlot="1234567890" />
                <AdComponent adSlot="2345678901" />
                <AdComponent adSlot="3456789012" />
              </div>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
