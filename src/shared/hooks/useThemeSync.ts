import { colorScheme } from 'nativewind';
import { useEffect } from 'react';

import { usePreferencesStore } from '@/stores/preferencesStore';

/**
 * Aplica a preferência de Aparência (Perfil → Aparência) de verdade —
 * `colorScheme.set()` é a API do NativeWind que troca a classe `dark` no
 * documento (web) / no runtime de estilos (nativo), fazendo toda className
 * Tailwind já usada nas telas (bg-surface-bg, text-ink...) mudar de valor
 * sozinha (ver `global.css`/`tailwind.config.js`). "Automático" mapeia para
 * `'system'`, que segue o tema do aparelho. Roda de novo sempre que
 * `appearance` mudar — inclusive na primeira vez que o valor persistido
 * termina de reidratar do `AsyncStorage` (`usePreferencesStore` começa com
 * `'light'` e atualiza depois, ver `docs/DECISIONS.md`, item 29).
 */
export function useThemeSync(): void {
  const appearance = usePreferencesStore((s) => s.appearance);

  useEffect(() => {
    colorScheme.set(appearance === 'auto' ? 'system' : appearance);
  }, [appearance]);
}
