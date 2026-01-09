/**
 * Google Analytics utility functions for tracking user interactions
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Check if Google Analytics is initialized
 */
export const isGAInitialized = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Generic event tracking function
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
): void => {
  if (!isGAInitialized()) {
    // GA not initialized - silently skip tracking in development
    return;
  }

  try {
    window.gtag!('event', eventName, parameters);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Task Operations
export const trackTaskCreated = (method: 'manual' | 'quick' | 'markdown' | 'import') => {
  trackEvent('task_created', {
    event_category: 'task',
    event_label: method,
    method,
  });
};

export const trackTaskCompleted = () => {
  trackEvent('task_completed', {
    event_category: 'task',
  });
};

export const trackTaskUncompleted = () => {
  trackEvent('task_uncompleted', {
    event_category: 'task',
  });
};

export const trackTaskUpdated = () => {
  trackEvent('task_updated', {
    event_category: 'task',
  });
};

export const trackTaskDeleted = () => {
  trackEvent('task_deleted', {
    event_category: 'task',
  });
};

export const trackSubtaskAdded = () => {
  trackEvent('subtask_added', {
    event_category: 'task',
  });
};

export const trackSectionAdded = () => {
  trackEvent('section_added', {
    event_category: 'task',
  });
};

export const trackTaskMoved = () => {
  trackEvent('task_moved', {
    event_category: 'task',
  });
};

// List Management Operations
export const trackListCreated = () => {
  trackEvent('list_created', {
    event_category: 'list',
  });
};

export const trackListSwitched = () => {
  trackEvent('list_switched', {
    event_category: 'list',
  });
};

export const trackListDeleted = () => {
  trackEvent('list_deleted', {
    event_category: 'list',
  });
};

export const trackListRenamed = () => {
  trackEvent('list_renamed', {
    event_category: 'list',
  });
};

// Data Operations
export const trackMarkdownExported = () => {
  trackEvent('markdown_exported', {
    event_category: 'data',
    event_label: 'clipboard',
  });
};

export const trackMarkdownDownloaded = () => {
  trackEvent('markdown_downloaded', {
    event_category: 'data',
    event_label: 'file',
  });
};

export const trackMarkdownImported = (success: boolean) => {
  trackEvent('markdown_imported', {
    event_category: 'data',
    event_label: success ? 'success' : 'failure',
    success,
  });
};

export const trackUndoAction = () => {
  trackEvent('undo_action', {
    event_category: 'action',
  });
};

// UI Interactions
export const trackEditorToggled = (isMinimized: boolean) => {
  trackEvent('editor_toggled', {
    event_category: 'ui',
    event_label: isMinimized ? 'minimized' : 'expanded',
    is_minimized: isMinimized,
  });
};

export const trackHideCompletedToggled = (hideCompleted: boolean) => {
  trackEvent('hide_completed_toggled', {
    event_category: 'ui',
    event_label: hideCompleted ? 'hidden' : 'visible',
    hide_completed: hideCompleted,
  });
};

export const trackSearchUsed = (queryLength: number) => {
  trackEvent('search_used', {
    event_category: 'ui',
    event_label: 'search',
    query_length: queryLength,
  });
};

export const trackMarkdownEdited = () => {
  trackEvent('markdown_edited', {
    event_category: 'input',
  });
};

// Bulk operations
export const trackBulkTasksAdded = (count: number, method: 'markdown' | 'import') => {
  trackEvent('bulk_tasks_added', {
    event_category: 'task',
    event_label: method,
    task_count: count,
    method,
  });
};

// Markdown Visualizer
export const trackMarkdownVisualizerOpened = () => {
  trackEvent('markdown_visualizer_opened', {
    event_category: 'feature',
  });
};

export const trackMarkdownVisualizerFileUploaded = () => {
  trackEvent('markdown_visualizer_file_uploaded', {
    event_category: 'feature',
    event_label: 'file',
  });
};

export const trackMarkdownVisualizerTextPasted = () => {
  trackEvent('markdown_visualizer_text_pasted', {
    event_category: 'feature',
    event_label: 'paste',
  });
};

export const trackMarkdownVisualizerConvertedToTasks = (taskCount: number) => {
  trackEvent('markdown_visualizer_converted', {
    event_category: 'feature',
    event_label: 'convert',
    task_count: taskCount,
  });
};

// Page View Tracking
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (!isGAInitialized()) return;

  try {
    window.gtag!('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Engagement & Session Tracking
export const trackEngagement = (engagementType: 'scroll' | 'time_on_page' | 'interaction', details?: Record<string, unknown>) => {
  trackEvent('user_engagement', {
    event_category: 'engagement',
    engagement_type: engagementType,
    ...details,
  });
};

export const trackSessionStart = () => {
  trackEvent('session_start', {
    event_category: 'session',
    timestamp: new Date().toISOString(),
  });
};

export const trackFeatureUsage = (featureName: string, action: string) => {
  trackEvent('feature_usage', {
    event_category: 'feature',
    feature_name: featureName,
    action,
  });
};
