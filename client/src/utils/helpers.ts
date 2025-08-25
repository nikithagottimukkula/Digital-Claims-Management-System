import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ClaimStatus, Priority, UserRole } from '@/types';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Status utilities
export const getStatusColor = (status: ClaimStatus): string => {
  const statusColors: Record<ClaimStatus, string> = {
    DRAFT: 'gray',
    SUBMITTED: 'blue',
    IN_REVIEW: 'yellow',
    INFO_REQUESTED: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    PAID: 'emerald',
    CLOSED: 'gray',
  };
  return statusColors[status] || 'gray';
};

export const getStatusLabel = (status: ClaimStatus): string => {
  const statusLabels: Record<ClaimStatus, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    INFO_REQUESTED: 'Info Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PAID: 'Paid',
    CLOSED: 'Closed',
  };
  return statusLabels[status] || status;
};

export const getPriorityColor = (priority: Priority): string => {
  const priorityColors: Record<Priority, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    URGENT: 'red',
  };
  return priorityColors[priority] || 'gray';
};

export const getPriorityLabel = (priority: Priority): string => {
  const priorityLabels: Record<Priority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return priorityLabels[priority] || priority;
};

// Role utilities
export const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    POLICYHOLDER: 'Policyholder',
    ADJUSTER: 'Adjuster',
    SUPERVISOR: 'Supervisor',
    ADMIN: 'Admin',
  };
  return roleLabels[role] || role;
};

export const canTransitionStatus = (
  currentStatus: ClaimStatus,
  targetStatus: ClaimStatus,
  userRole: UserRole
): boolean => {
  const transitions: Record<ClaimStatus, ClaimStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['IN_REVIEW', 'REJECTED'],
    IN_REVIEW: ['INFO_REQUESTED', 'APPROVED', 'REJECTED'],
    INFO_REQUESTED: ['IN_REVIEW', 'REJECTED'],
    APPROVED: ['PAID', 'REJECTED'],
    REJECTED: ['IN_REVIEW'],
    PAID: ['CLOSED'],
    CLOSED: [],
  };

  const allowedTransitions = transitions[currentStatus] || [];
  if (!allowedTransitions.includes(targetStatus)) {
    return false;
  }

  // Role-based restrictions
  if (userRole === 'POLICYHOLDER') {
    return currentStatus === 'DRAFT' && targetStatus === 'SUBMITTED';
  }

  if (userRole === 'ADJUSTER') {
    return !['APPROVED', 'PAID'].includes(targetStatus);
  }

  return true; // SUPERVISOR and ADMIN can perform all allowed transitions
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  return '📎';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
