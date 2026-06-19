import { useQuery } from '@tanstack/react-query'
import { getAccountHistory } from '../lib/hiveApi'
import type { OwnedFish } from '../store/appStore'

const APP_ID = 'hive-aquarium/1.0'

async function fetchOwnedFish(username: string): Promise<OwnedFish[]> {
  const history = await getAccountHistory(username)
  const owned: Record<string, OwnedFish> = {}

  history.forEach(([, entry]) => {
    const [opType, opData] = entry.op
    if (opType !== 'custom_json' || (opData as { id?: string }).id !== APP_ID) return

    try {
      const json = JSON.parse((opData as { json: string }).json)
      if (json.action === 'add_fish' && json.fish_id) {
        owned[json.fish_id] = {
          id: json.fish_id,
          name: json.fish_name ?? json.fish_id,
          boughtAt: entry.timestamp,
        }
      }
      if (json.action === 'remove_fish' && json.fish_id) {
        delete owned[json.fish_id]
      }
    } catch {}
  })

  return Object.values(owned)
}

export function useOwnedFish(username: string | null) {
  return useQuery({
    queryKey: ['ownedFish', username],
    queryFn: () => fetchOwnedFish(username!),
    enabled: !!username,
    staleTime: Infinity,
  })
}
