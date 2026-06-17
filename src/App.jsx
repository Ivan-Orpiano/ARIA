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

