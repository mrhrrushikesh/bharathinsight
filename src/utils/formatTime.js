// src/utils/formatTime.js (or add within Home.js)
import { formatDistanceToNow, parseISO } from 'date-fns';

export const formatTimeAgo = (dateString) => {
  if (!dateString) {
    return '';
  }
  try {
    // WordPress date is often ISO 8601 format
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error parsing date:", error);
    return ''; // Return empty string or default text on error
  }
};