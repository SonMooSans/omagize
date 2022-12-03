import { Keys } from './queries';
import { useQuery } from '@tanstack/react-query';
import { fetchUserNotifications, fetchGroupNotifications } from '@omagize/api';

export function useUserNotificationsQuery() {
  return useQuery(Keys.notifications.user, () => fetchUserNotifications());
}

export function useGroupNotificationsQuery(id: string) {
  return useQuery(Keys.notifications.group(id), () => fetchGroupNotifications(id));
}