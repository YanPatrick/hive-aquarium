import { useAppStore } from '../store/appStore'
import { useToastStore } from '../components/common/Toast'
import { waitForKeychain } from './useKeychain'

export function useInteractions() {
  const user = useAppStore(s => s.user)

  async function getKeychain() {
    try {
      return await waitForKeychain()
    } catch {
      useToastStore.getState().show('Keychain não encontrado', 'Instale a extensão Hive Keychain.', true)
      return null
    }
  }

  async function vote(author: string, permlink: string, weight: number) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    await new Promise<void>((resolve) => {
      keychain.requestVote(user.username, author, permlink, weight, (res) => {
        if (res.success) useToastStore.getState().show('Voto registrado!', `+1 em @${author}`)
        else useToastStore.getState().show('Erro ao votar', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  async function comment(parentAuthor: string, parentPermlink: string, body: string) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    const permlink = `re-${parentAuthor.replace(/\./g, '-')}-${Date.now()}`
    const op = ['comment', {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author: user.username,
      permlink,
      title: '',
      body,
      json_metadata: JSON.stringify({ app: 'hive-aquarium/1.0' }),
    }]
    await new Promise<void>((resolve) => {
      keychain.requestBroadcast(user.username, [op], 'Posting', (res) => {
        if (res.success) useToastStore.getState().show('Comentário publicado!', '')
        else useToastStore.getState().show('Erro ao comentar', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  async function publishSnap(containerPermlink: string, body: string) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    const permlink = `re-peak-snaps-${Date.now()}`
    const op = ['comment', {
      parent_author: 'peak.snaps',
      parent_permlink: containerPermlink,
      author: user.username,
      permlink,
      title: '',
      body,
      json_metadata: JSON.stringify({ app: 'snaps/1.0', tags: [] }),
    }]
    await new Promise<void>((resolve) => {
      keychain.requestBroadcast(user.username, [op], 'Posting', (res) => {
        if (res.success) useToastStore.getState().show('Snap publicado!', '')
        else useToastStore.getState().show('Erro ao publicar snap', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  return { vote, comment, publishSnap }
}
