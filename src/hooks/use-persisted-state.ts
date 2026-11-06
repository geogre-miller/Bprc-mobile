import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

/** AsyncStorage key for a `usePersistedState` key, for code that must write several keys together. */
export const persistedStorageKey = (key: string) => `rayGia:${key}`;

/** Local-only persistence until accounts/backend exist, swap for a server sync later. */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = persistedStorageKey(key);
  // Latest value, so the updater stays pure and the write happens outside it.
  const valueRef = useRef(value);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        if (cancelled || !stored) return;
        try {
          const parsed = JSON.parse(stored) as T;
          valueRef.current = parsed;
          setValue(parsed);
        } catch {
          // Corrupt entry: keep the initial value instead of crashing the screen.
        }
      })
      .catch(() => {
        // Storage unavailable: fall back to the initial value.
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (current: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      setValue(resolved);
      AsyncStorage.setItem(storageKey, JSON.stringify(resolved)).catch(() => {
        // Write failed: in-memory state stays correct for this session.
      });
    },
    [storageKey],
  );

  return [value, update, isLoaded] as const;
}
