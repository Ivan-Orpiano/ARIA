import { useState, useCallback, useRef } from 'react';
import {
  buildFilePreview,   // was: createFilePreview
  validateFile,
} from '../utils/fileUtils';

/** Max files allowed per message – not exported by fileUtils, so defined here */
const MAX_FILES_PER_MSG = 5;

/**
 * useFileUpload – manages selected file state, validation,
 * drag-and-drop, and cleanup.
 */
export function useFileUpload() {
  const [files, setFiles]           = useState([]); // FilePreview[]
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const inputRef = useRef(null);

  /* ── Revoke an object-URL preview (replaces missing revokePreview) ── */
  const revokePreview = useCallback((filePreview) => {
    if (filePreview?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview.previewUrl);
    }
  }, []);

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
      const combined = [...prev, ...valid.map(buildFilePreview)]; // was: createFilePreview
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
  }, [revokePreview]);

  /* ── Clear all files ─────────────────────────────────────────── */
  const clearFiles = useCallback(() => {
    setFiles((prev) => { prev.forEach(revokePreview); return []; });
    setFileErrors([]);
  }, [revokePreview]);

  /* ── Open the file picker ─────────────────────────────────────── */
  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /* ── Drag handlers ────────────────────────────────────────────── */
  const onDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragActive(false);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  /* ── Input change handler ─────────────────────────────────────── */
  const onInputChange = useCallback((e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  return {
    files,
    fileErrors,
    dragActive,
    inputRef,
    addFiles,
    removeFile,
    clearFiles,
    openPicker,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onInputChange,
    hasFiles:   files.length > 0,
    canAddMore: files.length < MAX_FILES_PER_MSG,
  };
}