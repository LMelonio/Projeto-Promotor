import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import type { Coordinates } from '@/shared/utils/geo';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

/**
 * Captura a localização atual do dispositivo para o check-in georreferenciado.
 * Sempre pede uma leitura nova de GPS (nunca usa posição em cache) — a
 * coordenada registrada precisa refletir o momento real da visita, mesma
 * preocupação de integridade de dado já registrada para fotos obrigatórias
 * em `docs/DECISIONS.md` (item 8).
 */
export function useLocation() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setStatus('requesting');
    setErrorMessage(null);

    const { status: permission } = await Location.requestForegroundPermissionsAsync();
    if (permission !== 'granted') {
      setStatus('denied');
      setErrorMessage('Permissão de localização negada. Ative-a nas configurações do aparelho.');
      return null;
    }

    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setStatus('granted');
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch {
      setStatus('error');
      setErrorMessage('Não foi possível obter sua localização agora. Tente novamente.');
      return null;
    }
  }, []);

  return { status, errorMessage, requestLocation };
}
