import { NOTIFICATIONS } from '@/data/notifications';
import { usePersistedState } from '@/hooks/use-persisted-state';

/** Which notifications the user has read. Shared by the Notifications screen and the header bell. */
export function useReadNotifications() {
  const [readIds, setReadIds, isLoaded] = usePersistedState<string[]>('notifications-read', []);
  const unreadCount = NOTIFICATIONS.filter((item) => item.unread && !readIds.includes(item.id)).length;
  const markAllRead = () => setReadIds(NOTIFICATIONS.map((item) => item.id));
  return { readIds, unreadCount, markAllRead, isLoaded };
}
