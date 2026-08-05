import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  useActiveVisit,
  useQuestionnaire,
  useRegisterActivity,
  useSubmitQuestionnaire,
} from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { SelectableList } from '@/components/ui/SelectableList';
import { PDV_QUESTIONNAIRE, type QuestionnaireAnswers } from '@/models/Questionnaire';
import type { VisitaStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

/**
 * Questionário de PDV (wireframe "7-Questionário", Documentação Funcional):
 * assistente passo a passo, uma pergunta de múltipla escolha por vez —
 * substitui as 4 perguntas Sim/Não de uma tela só assumidas na Fase 3 (ver
 * `docs/DECISIONS.md`, item 21).
 */
export function QuestionarioScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const activeVisit = useActiveVisit(promoterId);
  const visitId = activeVisit.data?.visitId;

  const questionnaire = useQuestionnaire(visitId);
  const submitQuestionnaire = useSubmitQuestionnaire(visitId);
  const registerActivity = useRegisterActivity(visitId);

  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [step, setStep] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && questionnaire.data) {
      setAnswers(questionnaire.data);
      initialized.current = true;
    }
  }, [questionnaire.data]);

  if (activeVisit.isLoading || questionnaire.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando questionário..." />
      </ScreenContainer>
    );
  }

  if (!activeVisit.data) {
    return (
      <ScreenContainer>
        <ErrorState message="Nenhuma visita em andamento." onRetry={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const question = PDV_QUESTIONNAIRE[step];
  if (!question) return null;

  const isLast = step === PDV_QUESTIONNAIRE.length - 1;
  const isFirst = step === 0;
  const selected = answers[question.id];

  async function handleNext() {
    if (selected === undefined) return;

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    if (!activeVisit.data || !promoterId) return;
    await submitQuestionnaire.mutateAsync(answers);
    await registerActivity.mutateAsync({
      clientId: activeVisit.data.clientId,
      promoterId,
      kind: 'questionnaire',
      photoCount: 0,
    });
    navigation.goBack();
  }

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-center gap-3 mt-4 mb-5">
        <Feather
          name="chevron-left"
          size={24}
          color={colors.ink}
          onPress={() => navigation.goBack()}
        />
        <Text className="text-ink font-extrabold text-xl flex-1" numberOfLines={1}>
          Questionário de PDV
        </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text className="text-ink-muted text-sm">Sair</Text>
        </Pressable>
      </View>

      <Text className="text-ink-muted text-xs mb-2">
        Pergunta {step + 1} de {PDV_QUESTIONNAIRE.length}
      </Text>
      <View className="h-1.5 rounded-full bg-line mb-5 overflow-hidden">
        <View
          className="h-full rounded-full bg-brand"
          style={{ width: `${((step + 1) / PDV_QUESTIONNAIRE.length) * 100}%` }}
        />
      </View>

      <Text className="text-ink font-bold text-lg mb-4">{question.text}</Text>

      <SelectableList
        items={question.options.map((option, index) => ({ value: index, label: option }))}
        value={selected ?? null}
        onChange={(index) => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
        className="mb-6"
      />

      {submitQuestionnaire.isError || registerActivity.isError ? (
        <Text className="text-danger text-xs mb-3">
          Não foi possível salvar o questionário agora. Tente novamente.
        </Text>
      ) : null}

      <View className="flex-row gap-3">
        <Button
          label="Anterior"
          variant="ghost"
          className="flex-1"
          disabled={isFirst}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
        />
        <Button
          label={isLast ? 'Concluir' : 'Próxima'}
          className="flex-1"
          disabled={selected === undefined}
          loading={submitQuestionnaire.isPending || registerActivity.isPending}
          onPress={handleNext}
        />
      </View>
    </ScreenContainer>
  );
}
