import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './styles/globals.css';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Header  from './components/layout/Header';

import ChatPage     from './pages/ChatPage';
import FilesPage    from './pages/FilesPage';
import CalendarPage from './pages/CalendarPage';
import EmailPage    from './pages/EmailPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

/* Three responsive tiers:
   · mobile  ≤ 768   → sidebar is an off-canvas drawer (burger opens it)
   · tablet 769–1024 → sidebar starts as a compact rail (content first)
   · desktop ≥ 1025  → sidebar starts expanded                            */
const MOBILE_BREAKPOINT  = 768;
const DESKTOP_BREAKPOINT = 1024;

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

function AppLayout() {
  // Tablet defaults to the rail so content gets the space it needs.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth > DESKTOP_BREAKPOINT
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes,
  // so picking a nav item on mobile doesn't leave the drawer open over it.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // If the viewport grows past the mobile breakpoint (rotation, window
  // resize), drop the drawer state so it can't linger open off-context.
  useEffect(() => {
    const handleResize = () => {
      if (!isMobileViewport()) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape closes the drawer — standard overlay behaviour.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const toggleSidebar = useCallback(() => {
    if (isMobileViewport()) {
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
        <Header onToggleSidebar={toggleSidebar} mobileNavOpen={mobileOpen} />

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
      <ThemeProvider>
        <ChatProvider>
          <AppLayout />
        </ChatProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}