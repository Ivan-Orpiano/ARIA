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


const MOBILE_BREAKPOINT  = 768;
const DESKTOP_BREAKPOINT = 1024;

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth > DESKTOP_BREAKPOINT
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);


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

  // Mobile: a swipe in from the left edge opens the drawer.
  // (The sidebar logo toggles/closes; there is no header opener.)
  useEffect(() => {
    const EDGE = 28;        // px from the left where a swipe may start
    const THRESHOLD = 45;   // px of rightward travel to trigger open
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e) => {
      if (mobileOpen || !isMobileViewport()) return;
      const t = e.touches[0];
      if (t.clientX <= EDGE) {
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
      }
    };
    const onTouchMove = (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // Horizontal-dominant rightward swipe only.
      if (dx > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        setMobileOpen(true);
        tracking = false;
      }
    };
    const onTouchEnd = () => { tracking = false; };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
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
        onToggle={toggleSidebar}
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
        <Header />

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
