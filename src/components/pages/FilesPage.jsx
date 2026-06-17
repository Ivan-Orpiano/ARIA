import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { FilesIcon } from '../components/icons/Icons';

export default function FilesPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <EmptyState
        icon={<FilesIcon size={28} />}
        title="No files yet"
        description="Files you share with ARIA, or documents ARIA generates during a conversation, will show up here."
        actionLabel="Go to chat"
        onAction={() => navigate('/')}
      />
    </div>
  );
}