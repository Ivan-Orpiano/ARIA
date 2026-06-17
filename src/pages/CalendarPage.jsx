import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { CalendarIcon } from '../components/icons/Icons';

export default function CalendarPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <EmptyState
        icon={<CalendarIcon size={28} />}
        title="No events scheduled"
        description="Ask ARIA to schedule a meeting or create an event, and it will appear here once calendar sync is connected."
        actionLabel="Go to chat"
        onAction={() => navigate('/')}
      />
    </div>
  );
}