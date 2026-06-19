import { create } from 'zustand'

export interface HiveUser {
  username: string
  avatarUrl: string
  hivePower: number
  hiveBalance: string
}

export interface OwnedFish {
  id: string
  name: string
  boughtAt: string
}

interface AppStore {
  user: HiveUser | null
  login(user: HiveUser): void
  logout(): void

  myFish: OwnedFish[]
  setFish(fish: OwnedFish[]): void
  addFish(fish: OwnedFish): void

  activeTab: 'posts' | 'snaps'
  activeTag: string | null
  setTab(tab: 'posts' | 'snaps'): void
  setTag(tag: string | null): void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null, myFish: [] }),

  myFish: [],
  setFish: (fish) => set({ myFish: fish }),
  addFish: (fish) => set((s) => ({ myFish: [...s.myFish, fish] })),

  activeTab: 'posts',
  activeTag: null,
  setTab: (activeTab) => set({ activeTab }),
  setTag: (activeTag) => set({ activeTag }),
}))
