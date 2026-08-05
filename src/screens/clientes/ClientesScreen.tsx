import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';

import { ClientCard } from './components/ClientCard';
import { useClientPortfolio } from './useClientesData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import type { ClientListItem } from '@/models/Client';
import type { ClientesStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { useThemeColors } from '@/theme';

type FilterKey = 'todos' | 'roteiro' | 'adimplente' | 'inadimplente';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'roteiro', label: 'Roteiro do dia' },
  { key: 'adimplente', label: 'Adimplentes' },
  { key: 'inadimplente', label: 'Inadimplentes' },
];

function matchesFilter(client: ClientListItem, filter: FilterKey): boolean {
  switch (filter) {
    case 'roteiro':
      return client.todayVisit !== null;
    case 'adimplente':
      return client.financialStatus === 'compliant';
    case 'inadimplente':
      return client.financialStatus === 'delinquent';
    default:
      return true;
  }
}

/**
 * Carteira de Clientes / Roteiro (wireframe "3 - Clientes", Fase 2).
 * Busca por nome/código ERP + filtros de segmento; cada card navega para o
 * Detalhe do Cliente, de onde o check-in é iniciado — decisão de produto já
 * registrada em `NextVisitCard` (Fase 1).
 */
export function ClientesScreen() {
  const navigation = useNavigation<NavigationProp<ClientesStackParamList>>();
  const colors = useThemeColors();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const portfolio = useClientPortfolio(promoterId);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todos');

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (portfolio.data ?? [])
      .filter((client) => matchesFilter(client, filter))
      .filter(
        (client) =>
          term.length === 0 ||
          client.tradeName.toLowerCase().includes(term) ||
          client.legalName.toLowerCase().includes(term) ||
          client.erpCode.toLowerCase().includes(term) ||
          client.cnpj.includes(term),
      );
  }, [portfolio.data, filter, search]);

  if (portfolio.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando sua carteira de clientes..." />
      </ScreenContainer>
    );
  }

  if (portfolio.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível carregar seus clientes agora."
          onRetry={() => portfolio.refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-baseline justify-between mt-4 mb-4">
        <Text className="text-ink font-extrabold text-xl">Clientes</Text>
        <Text className="text-ink-muted text-xs">{(portfolio.data ?? []).length} na carteira</Text>
      </View>

      <View className="flex-row items-center gap-2 h-12 px-4 rounded-input border border-line bg-surface-card mb-3">
        <Feather name="search" size={18} color={colors.inkMuted} />
        <TextInput
          className="flex-1 text-[15px] text-ink"
          placeholder="Buscar por nome, código ou CNPJ"
          placeholderTextColor={colors.inkMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View className="mb-1">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <Text
              onPress={() => setFilter(item.key)}
              className={`px-3.5 py-2 rounded-pill text-xs font-semibold overflow-hidden ${
                filter === item.key
                  ? 'bg-brand text-white'
                  : 'bg-surface-card border border-line text-ink-muted'
              }`}
            >
              {item.label}
            </Text>
          )}
        />
      </View>

      {filteredClients.length === 0 ? (
        <Text className="text-ink-muted text-sm py-8 text-center">
          Nenhum cliente encontrado para este filtro.
        </Text>
      ) : (
        <FlatList
          className="flex-1"
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() => navigation.navigate('ClienteDetalhe', { clientId: item.id })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </ScreenContainer>
  );
}
