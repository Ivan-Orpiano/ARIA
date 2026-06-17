import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './styles/globals.css';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/layout/Sidebar';
import Header  from './components/layout/Header';

import ChatPage     from './pages/ChatPage';
import FilesPage    from './pages/FilesPage';
import CalendarPage from './pages/CalendarPage';
import EmailPage    from './pages/EmailPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const MOBILE_BREAKPOINT = 768;

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes,
  // so picking a nav item on mobile doesn't leave the drawer open over it.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT) {
      setMobileOpen((open) => !open);
    } else {
      setSidebarOpen((open) => !open);
    }
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className="sidebar-scrim"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="app-main">
        <Header onToggleSidebar={toggleSidebar} />

        <div className="app-content">
          <Routes>
            <Route path="/"         element={<ChatPage />} />
            <Route path="/files"    element={<FilesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/email"    element={<EmailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*"         element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AppLayout />
      </ChatProvider>
    </BrowserRouter>
  );
}