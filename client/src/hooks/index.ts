import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { RootState, AppDispatch } from '@/store';
import { debounce } from '@/utils/helpers';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
};

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
  };
};

export const usePermissions = () => {
  const { user } = useAuth();

  const canViewClaim = useCallback((claimantId?: string) => {
    if (!user) return false;
    if (['ADMIN', 'SUPERVISOR'].includes(user.role)) return true;
    if (user.role === 'ADJUSTER') return true; // Adjusters can view assigned claims
    if (user.role === 'POLICYHOLDER') return user.id === claimantId;
    return false;
  }, [user]);

  const canEditClaim = useCallback((claimantId?: string, status?: string) => {
    if (!user) return false;
    if (['ADMIN', 'SUPERVISOR'].includes(user.role)) return true;
    if (user.role === 'ADJUSTER') return status !== 'DRAFT';
    if (user.role === 'POLICYHOLDER') return user.id === claimantId && status === 'DRAFT';
    return false;
  }, [user]);

  const canApproveClaim = useCallback(() => {
    return user ? ['ADMIN', 'SUPERVISOR'].includes(user.role) : false;
  }, [user]);

  const canAssignClaim = useCallback(() => {
    return user ? ['ADMIN', 'SUPERVISOR'].includes(user.role) : false;
  }, [user]);

  return {
    canViewClaim,
    canEditClaim,
    canApproveClaim,
    canAssignClaim,
  };
};
