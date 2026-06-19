import { useQuery } from '@tanstack/react-query'
import { getAccounts } from '../lib/hiveApi'

export function useAccountBalance(username: string | null): string | null {
  const query = useQuery({
    queryKey: ['balance', username],
    queryFn: async () => {
      const accounts = await getAccounts([username!])
      return accounts[0]?.balance ?? null
    },
    enabled: !!username,
    staleTime: 60_000,
  })

  return query.data ?? null
}
