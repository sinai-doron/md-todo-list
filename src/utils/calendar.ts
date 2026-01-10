import type { Task } from '../types/Task';

/**
 * Format a date string (YYYY-MM-DD) to Google Calendar format (YYYYMMDD)
 */
function formatDateForGoogle(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/**
 * Get the next day from a date string (YYYY-MM-DD)
 */
function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Format date for ICS (YYYYMMDD)
 */
function formatDateForICS(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/**
 * Get current timestamp in ICS format (YYYYMMDDTHHMMSSZ)
 */
function getICSTimestamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate a Google Calendar URL for a task
 */
export function generateGoogleCalendarUrl(task: Task): string {
  if (!task.dueDate) return '';

  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.text,
    dates: `${formatDateForGoogle(task.dueDate)}/${formatDateForGoogle(getNextDay(task.dueDate))}`,
    details: `Task from MD Tasks\n${window.location.origin}`,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate ICS file content for a task
 */
export function generateICSContent(task: Task): string {
  if (!task.dueDate) return '';

  const uid = `${task.id}@todo.commandboard.online`;
  const dtstamp = getICSTimestamp();
  const dtstart = formatDateForICS(task.dueDate);
  const dtend = formatDateForICS(getNextDay(task.dueDate));
  const summary = task.text.replace(/[,;\\]/g, '\\$&'); // Escape special chars

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MD Tasks//todo.commandboard.online//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:Task from MD Tasks`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Download an ICS file for a task
 */
export function downloadICS(task: Task): void {
  const content = generateICSContent(task);
  if (!content) return;

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Generate filename from task text
  const filename = task.text
    .slice(0, 30)
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();

  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
