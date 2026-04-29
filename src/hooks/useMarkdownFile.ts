import { useState, useCallback } from 'react';

export interface UseMarkdownFileReturn {
  content: string;
  setContent: (content: string) => void;
  isDragging: boolean;
  error: string | null;
  clearError: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  // Performs the drop event cleanup (preventDefault/stopPropagation/clear
  // isDragging) and returns the dropped File, if any. The caller decides
  // whether to actually load it via handleFileSelect — this lets pages
  // gate file replacement behind a confirmation prompt.
  handleDrop: (e: React.DragEvent) => File | null;
  handleFileSelect: (file: File) => void;
  reset: () => void;
}

const MAX_FILE_SIZE = 1048576; // 1MB in bytes

export const useMarkdownFile = (): UseMarkdownFileReturn => {
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setError(null);
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file extension (.md only)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.md')) {
      setError('Invalid file type. Please select a .md file.');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum file size is 1MB.');
      return;
    }

    // Read file content
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result !== undefined) {
        setContent(result);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent): File | null => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    return e.dataTransfer.files?.[0] ?? null;
  }, []);

  return {
    content,
    setContent,
    isDragging,
    error,
    clearError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    reset,
  };
};
