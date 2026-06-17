import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChatIcon,
  FilesIcon,
  CalendarIcon,
  MailIcon,
  SettingsIcon,
  SparkleIcon,
  XIcon,
} from '../icons/Icons';

const NAV_ITEMS = [
  { to: '/',         label: 'Chat',     icon: ChatIcon,     end: true },
  { to: '/files',     label: 'Files',    icon: FilesIcon },
  { to: '/calendar',  label: 'Calendar', icon: CalendarIcon },
  { to: '/email',     label: 'Email',    icon: MailIcon },
  { to: '/settings',  label: 'Settings', icon: SettingsIcon },
];
