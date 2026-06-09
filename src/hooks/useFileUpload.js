import { useState, useCallback, useRef } from 'react';
import {
  createFilePreview,
  revokePreview,
  validateFile,
  MAX_FILES_PER_MSG,
} from '../utils/fileUtils';

/**
 * useFileUpload – manages selected file state, validation,
 * drag-and-drop, and cleanup.
 */
export function useFileUpload() {
  const [files, setFiles]         = useState([]); // FilePreview[]
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const inputRef = useRef(null);

  /* ── Add files ───────────────────────────────────────────────── */
  const addFiles = useCallback((rawFiles) => {
    const incoming = Array.from(rawFiles);
    const errors   = [];
    const valid    = [];

    for (const file of incoming) {
      const { valid: ok, error } = validateFile(file);
      if (!ok) { errors.push(`${file.name}: ${error}`); continue; }
      valid.push(file);
    }

    setFileErrors(errors);

    setFiles((prev) => {
      const combined = [...prev, ...valid.map(createFilePreview)];
      /* Enforce max cap */
      return combined.slice(0, MAX_FILES_PER_MSG);
    });
  }, []);

  /* ── Remove a single file ─────────────────────────────────────── */
  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) revokePreview(target);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

 
}