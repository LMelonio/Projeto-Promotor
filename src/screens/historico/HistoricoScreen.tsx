import { Feather } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';

import { useVisitHistory } from './useHistoryData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import type { VisitHistoryEntry } from '@/models/VisitHistoryEntry';
import { formatDurationMinutes } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

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
        <Text className="text-ink-muted text-xs">{formatVisitDate(entry.checkedInAt)}</Text>
      </View>

      <Text className="text-ink-muted text-xs">
        {formatVisitTime(entry.checkedInAt)} – {formatVisitTime(entry.checkedOutAt)} ·{' '}
        {formatDurationMinutes(entry.durationMinutes)}
      </Text>

      <View className="flex-row items-center gap-4 mt-1">
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
      </View>
    </Card>
  );
}

/** Histórico de visitas finalizadas (wireframe "Histórico", Fase 4) — mais recente primeiro. */
export function HistoricoScreen() {
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const history = useVisitHistory(promoterId);

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

      {(history.data ?? []).length === 0 ? (
        <Text className="text-ink-muted text-sm py-8 text-center">
          Nenhuma visita finalizada ainda.
        </Text>
      ) : (
        <FlatList
          data={history.data}
          keyExtractor={(item) => item.visitId}
          renderItem={({ item }) => <HistoryCard entry={item} />}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </ScreenContainer>
  );
}
