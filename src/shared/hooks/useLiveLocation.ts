import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordinates } from '@/shared/utils/geo';

type LiveLocationStatus = 'requesting' | 'watching' | 'denied' | 'error';

/**
 * Observa a posição do aparelho continuamente (não uma leitura única como
 * `useLocation`) — usado pela tela de Check-in dedicada para mostrar a
 * distância até o cliente em tempo real, antes de confirmar (wireframe
 * "Check-in", ver `docs/DECISIONS.md`, item 24).
 */
export function useLiveLocation() {
  const [status, setStatus] = useState<LiveLocationStatus>('requesting');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    async function start() {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (permission !== 'granted') {
        setStatus('denied');
        setErrorMessage('Permissão de localização negada. Ative-a nas configurações do aparelho.');
        return;
      }

      try {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
          (position) => {
            setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            setStatus('watching');
          },
        );
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('Não foi possível observar sua localização agora.');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      try {
        // No web, o `LocationSubscription` retornado por `watchPositionAsync`
        // não implementa `remove()` corretamente (throw ao desmontar,
        // derrubando a árvore React inteira) — mesma categoria de quirk de
        // `expo-location`/`expo-sqlite` no web já documentada em
        // `docs/DECISIONS.md`, item 18. Silenciar aqui é seguro: o efeito já
        // marcou `cancelled`, então o callback do watch não atualiza mais
        // este estado de qualquer forma.
        subscription?.remove();
      } catch {
        // intencional — ver comentário acima.
      }
    };
  }, []);

  return { status, coords, errorMessage };
}
