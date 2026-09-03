import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/** Local-only persistence until accounts/backend exist — swap for a server sync later. */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = `rayGia:${key}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored) setValue(JSON.parse(stored));
      setIsLoaded(true);
    });
  }, [storageKey]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (current: T) => T)(current) : next;
        AsyncStorage.setItem(storageKey, JSON.stringify(resolved));
        return resolved;
      });
    },
    [storageKey],
  );

  return [value, update, isLoaded] as const;
}
