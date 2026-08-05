import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Estado de conectividade em tempo real — usado pelo banner "Sem conexão"
 * da Home (ver `docs/DECISIONS.md`, item 27).
 *
 * No web, ignora `NetInfo` de propósito: quando `navigator.connection`
 * existe (Chromium tem, por padrão), o adaptador web do `netinfo` escuta o
 * evento `change` desse objeto — que só dispara em troca de *tipo* de
 * conexão (wifi↔celular), não em transições online/offline simples. Ou seja,
 * desconectar o Wi-Fi nunca atualiza o estado. `window`
 * `online`/`offline` são os eventos que realmente disparam nesse caso, então
 * o web usa-os diretamente. No nativo, `NetInfo` funciona corretamente via
 * APIs do SO (mesmo usado por `useAutoSync`).
 */
export function useNetworkStatus(): { isOffline: boolean } {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const update = () => setIsOffline(!navigator.onLine);
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  return { isOffline };
}
