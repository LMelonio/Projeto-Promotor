import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Cliente único do React Query — usado para TODO dado remoto (dashboard,
 * clientes, produtos, histórico...). Configuração pensada para o cenário de
 * uso real do promotor: rede de celular instável em campo.
 *
 * - retry: 2 tentativas automáticas antes de mostrar erro ao usuário.
 * - staleTime: 60s — evita refetch agressivo que consome dados móveis/bateria
 *   sem necessidade; dados como o resumo do dashboard não mudam a cada segundo.
 * - refetchOnReconnect: true — quando o app recupera conexão (comum ao sair
 *   de uma área sem sinal), busca dados atualizados automaticamente.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
