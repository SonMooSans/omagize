import { LoginPayload } from '../mappers/Auth';
import { Keys } from './keys';
import { useMutation, useQuery } from '@tanstack/react-query';
import { auth, logout } from '../AccountAPI';
import { client } from './client';
import { User } from '../mappers';

export function dispatchSelfUser(updated: User) {
  return client.setQueryData<LoginPayload>(Keys.login, (prev) => ({
    ...prev,
    user: updated,
  }));
}

export function useLogoutMutation() {
  return useMutation(() => logout(), {
    onSuccess() {
      client.setQueryData<LoginPayload | null>(Keys.login, null);
    },
  });
}

export function useLoginQuery() {
  return useQuery(Keys.login, () => auth(), {
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: true,
    retryDelay: 5000,
  });
}
