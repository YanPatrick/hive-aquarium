# Feed Interactions, Snaps & Aquarium Frame — Design Spec

**Data:** 2026-06-19  
**Branch:** feat/social-aquarium  

---

## Escopo

Três melhorias inter-relacionadas ao FeedPanel:

1. **Visual aquático** — FeedPanel passa a parecer submerso no aquário
2. **Snaps reais** — carregamento e publicação via `@peak.snaps`
3. **Interações nativas** — votar e comentar sem sair do Aquarium

---

## 1. Visual Aquático do FeedPanel

### Objetivo
O painel de feed deve dar a impressão de ser uma janela dentro d'água, não um overlay genérico.

### Mudanças visuais

**Container principal (`FeedPanel`):**
- Background: `rgba(0, 15, 40, 0.82)` com `backdrop-filter: blur(16px)`
- Border: borda com gradiente azul-verde usando pseudo-elemento `::before` ou `outline` + `box-shadow`
- `box-shadow` duplo interno: glow azul frio (`inset 0 0 40px rgba(0,180,220,0.08)`) + sombra esverdeada nas bordas (`0 0 60px rgba(0,120,180,0.25)`)

**Bolhas animadas:**
- 6–8 elementos `<span>` posicionados absolutamente nas laterais do painel
- `@keyframes bubbleRise` faz cada bolha subir de baixo para cima com opacity variando (0 → 0.6 → 0)
- Tamanhos: 4–10px de diâmetro; durações: 4s–9s; delays variados para parecer orgânico
- `overflow: hidden` no container — bolhas não vazam fora do painel
- Cor: `rgba(100, 220, 255, 0.4)` com borda `rgba(150, 240, 255, 0.6)`

**Cards (PostCard e SnapCard):**
- Background: `rgba(0, 25, 60, 0.55)` (levemente mais azul que o atual `rgba(0,20,50,0.5)`)
- Border: `rgba(0, 200, 220, 0.12)` (tom aquático em vez do `var(--border)` genérico)

---

## 2. Snaps via @peak.snaps

### Como funcionam os Snaps no Hive
- `@peak.snaps` publica um post container diário intitulado "Snaps Container // {data}"
- Usuários publicam snaps como **comentários** nesse container
- Buscar snaps = pegar o container mais recente → pegar seus `get_content_replies`

### Novas funções em `hiveApi.ts`

```ts
getDiscussionsByBlog(author: string, limit?: number): Promise<HivePost[]>
// condenser_api.get_discussions_by_blog — busca posts de @peak.snaps

getContentReplies(author: string, permlink: string): Promise<HivePost[]>
// condenser_api.get_content_replies — busca os snaps (comentários no container)
```

### Novo hook `useSnaps.ts` (substitui o atual)

- Fase 1: chama `getDiscussionsByBlog('peak.snaps', 1)` para achar o container do dia
- Fase 2: chama `getContentReplies(container.author, container.permlink)` para buscar os snaps
- Paginação local: armazena todos os snaps em memória, expõe fatia paginada de 20
- Retorna: `{ snaps, isLoading, isError, loadMore, hasMore, containerPermlink }`
- `containerPermlink` é necessário para publicar novos snaps

### Interface de Snaps no FeedPanel (aba Snaps)

**Área de composição (topo, apenas se logado):**
- `<textarea>` com placeholder "O que está acontecendo no Hive?"
- Contador de caracteres (max 280 recomendado)
- Botão "Snap" — desabilitado se vazio ou se estiver postando
- Ao clicar: chama `publishSnap(body)` → Keychain requestBroadcast → Toast de feedback

**Lista de snaps:**
- SnapCards com scroll
- Filtro de tags filtra localmente nos snaps já carregados (tags do `json_metadata`)
- Botão "Carregar mais" para próxima página local

### Publicar snap — `publishSnap` em `useInteractions.ts`

Operação Hive: `comment` com:
- `parent_author`: `peak.snaps`
- `parent_permlink`: permlink do container do dia
- `author`: usuário logado
- `permlink`: `re-peak-snaps-${Date.now()}`
- `title`: `""`
- `body`: texto do snap
- `json_metadata`: `JSON.stringify({ app: 'snaps/1.0', tags: [] })`

Enviado via `requestBroadcast` do Keychain.

---

## 3. Interações Nativas (Votar e Comentar)

### Novas operações em `useKeychain.ts`

Adicionar à declaração `Window['hive_keychain']`:

```ts
requestVote(
  username: string,
  author: string,
  permlink: string,
  weight: number,  // -10000 a 10000 (100% = 10000)
  callback: (response: { success: boolean; message?: string }) => void
): void

requestBroadcast(
  username: string,
  operations: unknown[][],
  key: string,
  callback: (response: { success: boolean; message?: string }) => void
): void
```

### Novo hook `useInteractions.ts`

```ts
vote(author, permlink, weight: number): Promise<void>
// Chama requestVote com weight * 100 (slider 1–100 → Hive 100–10000)
// Toast de sucesso: "Voto registrado!" / erro: mensagem do Keychain

comment(parentAuthor, parentPermlink, body): Promise<void>
// Monta operação comment, chama requestBroadcast
// permlink gerado: `re-${parentAuthor}-${Date.now()}`
// Toast de sucesso/erro

publishSnap(containerAuthor, containerPermlink, body): Promise<void>
// Alias de comment com json_metadata de snap
```

### UI de votação — VoteSlider (novo componente)

Fluxo:
1. Usuário clica em `▲ N` no card
2. Abre um bloco inline abaixo da linha de ações com:
   - Slider `<input type="range" min={1} max={100}>`
   - Label mostrando `{valor}%` atualizado em tempo real
   - Botão "Votar" (chama `vote`) + botão "×" para cancelar
3. Durante o `requestVote`: botão mostra "Votando..." e fica desabilitado
4. Após sucesso: slider fecha, contador +1, botão `▲` muda cor para `var(--glow)` e desabilita

Localização do componente: `src/components/Feed/VoteSlider.tsx`

### UI de comentário — inline no card

Fluxo:
1. Usuário clica em `💬 N`
2. Expande `<textarea>` abaixo do card com botão "Publicar" e "×" para fechar
3. Publicar chama `comment(post.author, post.permlink, body)`
4. Após sucesso: textarea fecha, contador +1, Toast "Comentário publicado!"

### Regra sem login
Se usuário não logado clicar em votar/comentar → Toast "Faça login para interagir." Sem redirecionamento.

### PostCard — mudanças
- Remove `<a href={peakdUrl}>` externo — vira `<div>` clicável sem navegação
- Barra de ações na base:
  ```
  [▲ N]  [💬 N]           [0.025 HBD]
  ```
- VoteSlider e textarea de comentário expandem abaixo quando ativos

### SnapCard — mesmas mudanças
- Sem link externo
- Mesmos botões ▲ e 💬

---

## Arquitetura de arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/lib/hiveApi.ts` | + `getDiscussionsByBlog`, `getContentReplies` |
| `src/hooks/useSnaps.ts` | Rewrite — busca de @peak.snaps |
| `src/hooks/useInteractions.ts` | Novo — vote, comment, publishSnap |
| `src/hooks/useKeychain.ts` | + `requestVote`, `requestBroadcast` na declaração |
| `src/components/Feed/FeedPanel.tsx` | Visual aquático + compose area para snaps |
| `src/components/Feed/PostCard.tsx` | Remove link externo, + VoteSlider, + comentário inline |
| `src/components/Feed/SnapCard.tsx` | Remove link externo, + VoteSlider, + comentário inline |
| `src/components/Feed/VoteSlider.tsx` | Novo componente |

---

## Fora do escopo

- Downvotes
- Ver lista completa de comentários existentes de um post
- Editar ou deletar posts/snaps
- Notificações de resposta
