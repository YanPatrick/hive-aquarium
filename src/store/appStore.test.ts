import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './appStore'

function getStore() {
  return useAppStore.getState()
}

beforeEach(() => {
  useAppStore.setState({
    user: null,
    myFish: [],
    activeTab: 'posts',
    activeTag: null,
  })
})

describe('auth', () => {
  it('login sets user', () => {
    getStore().login({ username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '0.000 HIVE' })
    expect(getStore().user?.username).toBe('alice')
  })

  it('logout clears user and fish', () => {
    getStore().login({ username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '0.000 HIVE' })
    getStore().addFish({ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' })
    getStore().logout()
    expect(getStore().user).toBeNull()
    expect(getStore().myFish).toHaveLength(0)
  })
})

describe('fish', () => {
  it('setFish replaces array', () => {
    getStore().setFish([{ id: 'tang', name: 'Tang Azul', boughtAt: '2026-01-01' }])
    expect(getStore().myFish).toHaveLength(1)
    expect(getStore().myFish[0].id).toBe('tang')
  })

  it('addFish appends', () => {
    getStore().addFish({ id: 'tang', name: 'Tang Azul', boughtAt: '2026-01-01' })
    getStore().addFish({ id: 'dragon', name: 'Peixe-Dragão', boughtAt: '2026-01-02' })
    expect(getStore().myFish).toHaveLength(2)
  })
})

describe('feed', () => {
  it('setTab updates activeTab', () => {
    getStore().setTab('snaps')
    expect(getStore().activeTab).toBe('snaps')
  })

  it('setTag updates activeTag', () => {
    getStore().setTag('#hive-aquarium')
    expect(getStore().activeTag).toBe('#hive-aquarium')
  })

  it('setTag null clears filter', () => {
    getStore().setTag('#art')
    getStore().setTag(null)
    expect(getStore().activeTag).toBeNull()
  })
})
