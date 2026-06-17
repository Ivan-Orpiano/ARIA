import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { MailIcon } from '../components/icons/Icons';

export default function EmailPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <EmptyState
        icon={<MailIcon size={28} />}
        title="No inbox connected"
        description="Connect an email account so ARIA can draft, send, and track messages on your behalf."
        actionLabel="Go to chat"
        onAction={() => navigate('/')}
      />
    </div>
  );
}