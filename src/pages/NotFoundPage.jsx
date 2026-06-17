import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <EmptyState
        icon={<span style={{ fontSize: 22, fontWeight: 800 }}>404</span>}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        actionLabel="Back to chat"
        onAction={() => navigate('/')}
      />
    </div>
  );
}