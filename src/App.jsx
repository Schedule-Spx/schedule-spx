// src/App.jsx
import React, { useContext, useState, useEffect } from 'react';
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

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [periodNames, setPeriodNames] = useState([
    "Period 1", "Period 2", "Period 3", "Period 4",
    "Period 5", "Period 6", "Period 7", "Period 8"
  ]);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('user');
    const savedExpiry = localStorage.getItem('sessionExpiry');
    if (savedUser && savedExpiry && new Date().getTime() < parseInt(savedExpiry)) {
      setUser(JSON.parse(savedUser));
    } else {
      // Clear expired session
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }

    // Load saved period names
    const savedPeriodNames = localStorage.getItem('periodNames');
    if (savedPeriodNames) {
      setPeriodNames(JSON.parse(savedPeriodNames));
    }
  }, []);

  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      // Set expiry to 1 month from now
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('sessionExpiry', expiry.toString());
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }
  };

  const updatePeriodNames = (newNames) => {
    setPeriodNames(newNames);
    localStorage.setItem('periodNames', JSON.stringify(newNames));
  };

  return (
    <div className={`App ${theme} flex flex-col min-h-screen`}>
      <NavBar user={user} setUser={updateUser} />
      <PeriodTitleUpdater periodNames={periodNames} />
      <Routes>
        <Route path="/admin" element={<Admin user={user} />} />
        <Route path="/account" element={<Account user={user} periodNames={periodNames} setPeriodNames={updatePeriodNames} />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/"
          element={
            <main className="flex-grow p-4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[40vh]">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <DayHeader />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Schedule periodNames={periodNames} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <GoogleCalendar />
                </div>
              </div>
              <div className="w-full my-4 flex-grow flex items-center justify-center">
                <PeriodProgress user={user} periodNames={periodNames} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[40vh]">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md"></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md"></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md"></div>
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
