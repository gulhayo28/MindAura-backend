import useSWR from 'swr'
import { fetcher } from './apiFetch'

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user/dashboard',
    fetcher,
    {
      refreshInterval: 30000,       // 30 soniyada yangilash
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}
