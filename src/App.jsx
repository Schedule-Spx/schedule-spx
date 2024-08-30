import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, useTheme } from './ThemeContext';
import './App.css';
import DayHeader from './DayHeader';
import QuickLinks from './QuickLinks';
import GoogleCalendar from './components/GoogleCalendar';
import PeriodProgress from './PeriodProgress';
import Schedule from './Schedule';
import GoogleSuiteLinks from './GoogleSuiteLinks';
import NavBar from './NavBar';
import Admin from './Admin';
import Account from './Account';
import About from './About';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import AgreementPopup from './components/AgreementPopup';

function ThemedApp() {
  const { currentTheme, changeTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [showAgreement, setShowAgreement] = useState(false);
  const [hasViewedDocs, setHasViewedDocs] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedExpiry = localStorage.getItem('sessionExpiry');
    if (savedUser && savedExpiry && new Date().getTime() < parseInt(savedExpiry)) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchUserTheme(parsedUser.email);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }

    const hasAgreed = localStorage.getItem('agreedToTerms');
    if (!hasAgreed) {
      setShowAgreement(true);
    }

    fetchSchedule();
  }, []);

  useEffect(() => {
    if (location.pathname === '/privacy' || location.pathname === '/terms') {
      setHasViewedDocs(true);
    }
  }, [location]);

  const fetchUserTheme = async (email) => {
    try {
      const response = await fetch(`https://schedule-api.devs4u.workers.dev/api/user-theme?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.theme && data.theme.name) {
          changeTheme(data.theme.name.toLowerCase());
        }
      }
    } catch (error) {
      console.error('Error fetching user theme:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/schedule');
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      console.log('Fetched schedule:', data);
      setWeekSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('sessionExpiry', expiry.toString());
      fetchUserTheme(newUser.email);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
      changeTheme('default');
    }
  };

  const handleAgree = () => {
    localStorage.setItem('agreedToTerms', 'true');
    setShowAgreement(false);
    if (hasViewedDocs) {
      navigate('/');
    }
  };

  const handleViewDocs = (path) => {
    setHasViewedDocs(true);
    navigate(path);
  };

  return (
    <div className={`App flex flex-col min-h-screen ${currentTheme.main} ${currentTheme.text}`}>
      <NavBar user={user} setUser={updateUser} />
      {showAgreement && location.pathname !== '/privacy' && location.pathname !== '/terms' && (
        <AgreementPopup onAgree={handleAgree} onViewDocs={handleViewDocs} hasViewedDocs={hasViewedDocs} />
      )}
      <Routes>
        <Route 
          path="/admin" 
          element={
            <div className="flex-grow flex flex-col">
              <Admin 
                user={user} 
                weekSchedule={weekSchedule} 
                setWeekSchedule={setWeekSchedule} 
                fetchSchedule={fetchSchedule} 
              />
            </div>
          } 
        />
        <Route 
          path="/account" 
          element={
            <div className="flex-grow flex flex-col h-[calc(100vh-64px)]">
              <Account 
                user={user} 
                weekSchedule={weekSchedule}
              />
            </div>
          } 
        />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route
          path="/"
          element={
            <main className="flex-grow p-4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 h-[calc(100vh-12rem)]">
                <div className="flex flex-col space-y-4 h-full">
                  <div className={`${currentTheme.accent} ${currentTheme.border} rounded-lg shadow-md overflow-hidden h-1/4`}>
                    <DayHeader />
                  </div>
                  <div className={`${currentTheme.accent} ${currentTheme.border} rounded-lg shadow-md overflow-hidden flex-grow`}>
                    <QuickLinks />
                  </div>
                </div>
                <div className={`${currentTheme.accent} ${currentTheme.border} rounded-lg shadow-md overflow-hidden h-full`}>
                  <Schedule weekSchedule={weekSchedule} />
                </div>
                <div className="flex flex-col space-y-4 h-full">
                  <div className={`${currentTheme.accent} ${currentTheme.border} rounded-lg shadow-md overflow-hidden flex-grow`}>
                    <GoogleCalendar />
                  </div>
                  <div className={`${currentTheme.accent} ${currentTheme.border} rounded-lg shadow-md overflow-hidden h-28`}>
                    <GoogleSuiteLinks />
                  </div>
                </div>
              </div>
              <div className="w-full mb-4 h-16">
                <PeriodProgress weekSchedule={weekSchedule} />
              </div>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

function AppContent() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
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
