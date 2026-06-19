export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface FishEntry {
  id: string
  name: string
  price: number
  rarity: Rarity
  desc: string
  memo: string
  glowColor: string
  svgString: (scale?: number) => string
}

export const FISH_CATALOG: FishEntry[] = [
  {
    id: 'clownfish', name: 'Peixe-Palhaço', price: 1, rarity: 'common',
    desc: 'O clássico peixe laranja e branco. Animado e curioso.',
    memo: 'buy:clownfish', glowColor: 'rgba(255,120,0,0.7)',
    svgString: (s = 1) => `<svg width="${70*s}" height="${45*s}" viewBox="0 0 70 45">
      <ellipse cx="32" cy="22" rx="20" ry="13" fill="#ff6a00"/>
      <ellipse cx="32" cy="22" rx="20" ry="13" fill="none" stroke="#e05000" stroke-width="1.5"/>
      <ellipse cx="14" cy="22" rx="6" ry="9" fill="#ff6a00" stroke="#e05000" stroke-width="1"/>
      <ellipse cx="22" cy="22" rx="3" ry="10" fill="white" opacity="0.85"/>
      <ellipse cx="36" cy="22" rx="3" ry="10" fill="white" opacity="0.85"/>
      <path d="M52 22 L65 10 L65 34 Z" fill="#ff6a00" stroke="#e05000" stroke-width="1"/>
      <circle cx="14" cy="18" r="3" fill="white"/>
      <circle cx="14" cy="18" r="1.5" fill="#111"/>
      <circle cx="13.3" cy="17.3" r="0.5" fill="white"/>
      <path d="M25 12 Q30 5 38 10" stroke="#e05000" stroke-width="2" fill="none"/>
      <path d="M25 32 Q30 40 38 35" stroke="#e05000" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    id: 'tang', name: 'Tang Azul', price: 2, rarity: 'common',
    desc: 'Peixe azul vibrante com toque amarelo na cauda.',
    memo: 'buy:tang', glowColor: 'rgba(30,140,255,0.7)',
    svgString: (s = 1) => `<svg width="${70*s}" height="${50*s}" viewBox="0 0 70 50">
      <ellipse cx="32" cy="25" rx="20" ry="14" fill="#1a6ee0"/>
      <ellipse cx="14" cy="25" rx="7" ry="11" fill="#1a6ee0"/>
      <path d="M52 25 L66 12 L66 38 Z" fill="#ffcc00"/>
      <path d="M10 20 Q5 12 2 25 Q5 38 10 30 Z" fill="#1a6ee0"/>
      <path d="M20 11 Q32 25 20 39" stroke="#0040a0" stroke-width="2.5" fill="none"/>
      <path d="M46 15 Q55 25 46 35" stroke="#ffcc00" stroke-width="3" fill="none"/>
      <circle cx="14" cy="21" r="3" fill="white"/>
      <circle cx="14" cy="21" r="1.5" fill="#111"/>
      <circle cx="13.3" cy="20.3" r="0.5" fill="white"/>
    </svg>`,
  },
  {
    id: 'angelfish', name: 'Peixe-Anjo', price: 3, rarity: 'rare',
    desc: 'Elegante e majestoso. Nada lentamente em curvas graciosas.',
    memo: 'buy:angelfish', glowColor: 'rgba(180,100,255,0.65)',
    svgString: (s = 1) => `<svg width="${55*s}" height="${70*s}" viewBox="0 0 55 70">
      <ellipse cx="27" cy="35" rx="14" ry="20" fill="#c8a0f0"/>
      <path d="M20 15 Q27 0 34 15" fill="#a070e0" stroke="#8050c0" stroke-width="1"/>
      <path d="M20 55 Q27 70 34 55" fill="#a070e0" stroke="#8050c0" stroke-width="1"/>
      <path d="M22 16 Q20 35 22 54" stroke="#8050c0" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M32 16 Q34 35 32 54" stroke="#8050c0" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M41 35 L55 22 L55 48 Z" fill="#a070e0"/>
      <circle cx="18" cy="28" r="3.5" fill="white"/>
      <circle cx="18" cy="28" r="2" fill="#220044"/>
      <circle cx="17" cy="27" r="0.7" fill="white"/>
    </svg>`,
  },
  {
    id: 'pufferfish', name: 'Baiacu', price: 4, rarity: 'rare',
    desc: 'Barrigudo e espinhoso. Infla quando se sente ameaçado!',
    memo: 'buy:pufferfish', glowColor: 'rgba(255,210,0,0.7)',
    svgString: (s = 1) => `<svg width="${65*s}" height="${60*s}" viewBox="0 0 65 60">
      <defs><radialGradient id="pg${Math.round(s*10)}" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffe066"/><stop offset="60%" stop-color="#f0b800"/><stop offset="100%" stop-color="#c08000"/>
      </radialGradient></defs>
      <ellipse cx="30" cy="30" rx="24" ry="22" fill="url(#pg${Math.round(s*10)})"/>
      <ellipse cx="30" cy="36" rx="16" ry="12" fill="#fffbe0" opacity="0.5"/>
      <circle cx="20" cy="22" r="3" fill="#8a6000" opacity="0.45"/>
      <circle cx="34" cy="18" r="2.5" fill="#8a6000" opacity="0.4"/>
      <circle cx="44" cy="26" r="2" fill="#8a6000" opacity="0.4"/>
      <circle cx="22" cy="36" r="2.5" fill="#8a6000" opacity="0.35"/>
      <circle cx="38" cy="38" r="2" fill="#8a6000" opacity="0.35"/>
      <line x1="12" y1="22" x2="6" y2="16" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="16" x2="10" y2="9" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="22" y1="10" x2="20" y2="3" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="32" y1="8" x2="32" y2="1" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="42" y1="10" x2="44" y2="3" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="50" y1="16" x2="55" y2="10" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="40" x2="9" y2="46" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="24" y1="50" x2="22" y2="57" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="51" x2="36" y2="58" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="46" y1="46" x2="50" y2="52" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M54 30 Q64 22 62 30 Q64 38 54 30 Z" fill="#f0b800" stroke="#c08000" stroke-width="1"/>
      <ellipse cx="8" cy="32" rx="3" ry="2.5" fill="#d09000"/>
      <ellipse cx="8" cy="32" rx="1.5" ry="1.2" fill="#804000"/>
      <circle cx="12" cy="24" r="5" fill="white"/>
      <circle cx="12" cy="24" r="3" fill="#1a1a00"/>
      <circle cx="11" cy="23" r="1.2" fill="white"/>
      <path d="M28 20 Q20 14 18 20 Q20 26 28 24 Z" fill="#f0c020" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'jellyfish', name: 'Água-Viva', price: 5, rarity: 'epic',
    desc: 'Flutuante e hipnótica. Brilha com luz própria nas profundezas.',
    memo: 'buy:jellyfish', glowColor: 'rgba(200,60,255,0.8)',
    svgString: (s = 1) => `<svg width="${55*s}" height="${70*s}" viewBox="0 0 55 70">
      <defs><radialGradient id="jg${Math.round(s*10)}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#e0a0ff" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#8020c0" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#4a00a0" stop-opacity="0.7"/>
      </radialGradient></defs>
      <path d="M5 30 Q5 5 27 5 Q49 5 49 30 Z" fill="url(#jg${Math.round(s*10)})"/>
      <path d="M5 30 Q5 5 27 5 Q49 5 49 30" stroke="rgba(220,160,255,0.6)" stroke-width="1.5" fill="none"/>
      <path d="M13 28 Q13 10 27 8 Q38 10 41 28" fill="rgba(255,255,255,0.14)"/>
      <path d="M12 30 Q9 42 12 52 Q9 60 10 65" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M18 30 Q15 43 18 54 Q15 62 16 68" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M27 31 Q25 44 27 56 Q25 64 27 70" stroke="#cc70ff" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M36 30 Q39 43 36 54 Q39 62 38 68" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M42 30 Q45 42 42 52 Q45 60 44 65" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <circle cx="18" cy="16" r="2.5" fill="rgba(255,220,255,0.8)"/>
      <circle cx="27" cy="12" r="2" fill="rgba(255,220,255,0.7)"/>
      <circle cx="36" cy="16" r="2" fill="rgba(255,220,255,0.7)"/>
    </svg>`,
  },
  {
    id: 'seahorse', name: 'Cavalo-Marinho', price: 6, rarity: 'epic',
    desc: 'Misterioso e delicado. Flutua verticalmente com graça.',
    memo: 'buy:seahorse', glowColor: 'rgba(240,160,40,0.75)',
    svgString: (s = 1) => `<svg width="${40*s}" height="${75*s}" viewBox="0 0 40 75">
      <path d="M20 12 Q30 12 30 22 Q30 32 22 35 Q28 40 28 50 Q28 62 20 65 Q12 62 12 50 Q12 40 18 35 Q10 32 10 22 Q10 12 20 12 Z" fill="#f0a030"/>
      <circle cx="20" cy="10" r="8" fill="#f0a030"/>
      <path d="M20 8 Q35 10 36 14" stroke="#d08020" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 28 Q40 25 38 32 Q36 38 28 33" fill="#e09025" opacity="0.7"/>
      <path d="M12 22 Q20 22 28 22" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M12 28 Q20 28 28 28" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M14 42 Q20 42 26 42" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M14 50 Q20 50 26 50" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <circle cx="24" cy="9" r="2.5" fill="white"/>
      <circle cx="24" cy="9" r="1.3" fill="#111"/>
      <circle cx="23.4" cy="8.4" r="0.4" fill="white"/>
      <path d="M15 4 L16 0 M20 3 L20 0 M24 4 L25 0" stroke="#d08020" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'dragon', name: 'Peixe-Dragão', price: 10, rarity: 'legendary',
    desc: 'Lendário das profundezas. Raridade extrema, brilho eterno.',
    memo: 'buy:dragon', glowColor: 'rgba(255,160,0,0.9)',
    svgString: (s = 1) => `<svg width="${90*s}" height="${55*s}" viewBox="0 0 90 55">
      <defs><linearGradient id="dg${Math.round(s*10)}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ff4400"/>
        <stop offset="50%" stop-color="#ff8800"/>
        <stop offset="100%" stop-color="#ffcc00"/>
      </linearGradient></defs>
      <ellipse cx="40" cy="27" rx="28" ry="16" fill="url(#dg${Math.round(s*10)})"/>
      <ellipse cx="16" cy="27" rx="9" ry="13" fill="#ff5500"/>
      <path d="M20 15 Q28 18 20 22" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M30 13 Q38 16 30 20" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M40 12 Q48 15 40 19" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M50 14 Q58 17 50 21" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M20 11 L23 3 L27 11 L31 2 L35 11 L39 4 L43 11 L47 3 L51 11 L55 6 L59 14" fill="#cc3300" stroke="#aa2200" stroke-width="1"/>
      <path d="M20 43 Q35 52 55 43" fill="#cc3300" opacity="0.7"/>
      <path d="M68 27 L85 12 L80 27 L85 42 Z" fill="#ff6600"/>
      <path d="M68 27 L82 15 M68 27 L82 39" stroke="#cc4400" stroke-width="2"/>
      <path d="M12 14 L9 6 M14 12 L14 5" stroke="#ffaa00" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="22" r="4" fill="#ffee00"/>
      <circle cx="12" cy="22" r="2" fill="#660000"/>
      <circle cx="11" cy="21" r="0.7" fill="white"/>
      <ellipse cx="40" cy="27" rx="30" ry="18" fill="none" stroke="rgba(255,180,0,0.2)" stroke-width="4"/>
    </svg>`,
  },
]

export const FISH_DIMS: Record<string, { w: number; h: number; cx: number; cy: number }> = {
  clownfish:  { w: 70, h: 45, cx: 35, cy: 22 },
  tang:       { w: 70, h: 50, cx: 35, cy: 25 },
  angelfish:  { w: 55, h: 70, cx: 27, cy: 35 },
  pufferfish: { w: 65, h: 60, cx: 32, cy: 30 },
  jellyfish:  { w: 55, h: 70, cx: 27, cy: 35 },
  seahorse:   { w: 40, h: 75, cx: 20, cy: 37 },
  dragon:     { w: 90, h: 55, cx: 45, cy: 27 },
}
