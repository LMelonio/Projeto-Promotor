import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';

import { useVisitHistory } from './useHistoryData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { VISIT_OUTCOME_LABEL } from '@/models/Visit';
import type { VisitHistoryEntry } from '@/models/VisitHistoryEntry';
import { formatDurationMinutes } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

type PeriodKey = 'hoje' | '7dias' | '30dias' | 'todos';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7dias', label: '7 dias' },
  { key: '30dias', label: '30 dias' },
  { key: 'todos', label: 'Todos' },
];

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function matchesPeriod(entry: VisitHistoryEntry, period: PeriodKey): boolean {
  const age = daysAgo(entry.checkedOutAt);
  switch (period) {
    case 'hoje':
      return age <= 0;
    case '7dias':
      return age <= 7;
    case '30dias':
      return age <= 30;
    default:
      return true;
  }
}

function formatVisitDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatVisitTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function HistoryCard({ entry }: { entry: VisitHistoryEntry }) {
  return (
    <Card className="gap-2 mb-3">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="text-ink text-sm font-semibold flex-1" numberOfLines={1}>
          {entry.clientName}
        </Text>
        <Text className="text-ink-muted text-xs">{formatVisitDate(entry.checkedOutAt)}</Text>
      </View>

      <Text className="text-ink-muted text-xs">
        {formatVisitTime(entry.checkedInAt)} – {formatVisitTime(entry.checkedOutAt)} ·{' '}
        {formatDurationMinutes(entry.durationMinutes)}
      </Text>

      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="check-square" size={14} color={colors.inkMuted} />
          <Text className="text-ink-muted text-xs">
            {entry.activityCount} atividade{entry.activityCount === 1 ? '' : 's'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="camera" size={14} color={colors.inkMuted} />
          <Text className="text-ink-muted text-xs">
            {entry.photoCount} foto{entry.photoCount === 1 ? '' : 's'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="alert-triangle" size={14} color={colors.inkMuted} />
          <Text className="text-ink-muted text-xs">
            {entry.rupturaCount} ruptura{entry.rupturaCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 flex-wrap mt-0.5">
        {entry.outcome ? (
          <Badge
            label={VISIT_OUTCOME_LABEL[entry.outcome]}
            tone={entry.outcome === 'completed' ? 'success' : 'warning'}
          />
        ) : null}
        <Badge
          label={entry.synced ? 'Sincronizada' : 'Na fila'}
          tone={entry.synced ? 'neutral' : 'warning'}
          icon={
            <Feather
              name={entry.synced ? 'check' : 'clock'}
              size={11}
              color={entry.synced ? colors.inkMuted : colors.warning}
            />
          }
        />
      </View>
    </Card>
  );
}

/**
 * Histórico de visitas finalizadas (wireframe "Histórico", Fase 4).
 * Filtros de período, busca por cliente, status de sincronização por visita
 * e contagem de rupturas adicionados a partir da Documentação Funcional real
 * — ver `docs/DECISIONS.md`, item 25.
 */
export function HistoricoScreen() {
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const history = useVisitHistory(promoterId);

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodKey>('todos');

  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (history.data ?? [])
      .filter((entry) => matchesPeriod(entry, period))
      .filter((entry) => term.length === 0 || entry.clientName.toLowerCase().includes(term));
  }, [history.data, period, search]);

  if (history.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando histórico de visitas..." />
      </ScreenContainer>
    );
  }

  if (history.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível carregar o histórico agora."
          onRetry={() => history.refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text className="text-ink font-extrabold text-xl mt-4 mb-4">Histórico</Text>

      <View className="flex-row items-center gap-2 h-12 px-4 rounded-input border border-line bg-surface-card mb-3">
        <Feather name="search" size={18} color={colors.inkMuted} />
        <TextInput
          className="flex-1 text-[15px] text-ink"
          placeholder="Buscar por cliente"
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
          data={PERIODS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <Text
              onPress={() => setPeriod(item.key)}
              className={`px-3.5 py-2 rounded-pill text-xs font-semibold overflow-hidden ${
                period === item.key
                  ? 'bg-brand text-white'
                  : 'bg-surface-card border border-line text-ink-muted'
              }`}
            >
              {item.label}
            </Text>
          )}
        />
      </View>

      {filteredHistory.length === 0 ? (
        <Text className="text-ink-muted text-sm py-8 text-center">
          Nenhuma visita encontrada para este filtro.
        </Text>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.visitId}
          renderItem={({ item }) => <HistoryCard entry={item} />}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </ScreenContainer>
  );
}
