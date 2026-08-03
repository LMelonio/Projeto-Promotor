import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';

import { useActiveVisit, useQuestionnaire, useSubmitQuestionnaire } from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { VisitaStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const EMPTY_ANSWERS: QuestionnaireAnswers = {
  productExposed: false,
  merchandisingMaterial: false,
  priceUpdated: false,
  needsRestocking: false,
  notes: '',
};

const QUESTIONS: { key: keyof Omit<QuestionnaireAnswers, 'notes'>; label: string }[] = [
  { key: 'productExposed', label: 'Produto exposto adequadamente?' },
  { key: 'merchandisingMaterial', label: 'Material de merchandising presente?' },
  { key: 'priceUpdated', label: 'Preço atualizado na etiqueta?' },
  { key: 'needsRestocking', label: 'Cliente precisa de reposição?' },
];

/** Questionário da visita (wireframe "Questionário", Fase 3) — 1 resposta por visita. */
export function QuestionarioScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const activeVisit = useActiveVisit(promoterId);
  const visitId = activeVisit.data?.visitId;

  const questionnaire = useQuestionnaire(visitId);
  const submitQuestionnaire = useSubmitQuestionnaire(visitId);

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(EMPTY_ANSWERS);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && questionnaire.data) {
      setAnswers(questionnaire.data);
      initialized.current = true;
    }
  }, [questionnaire.data]);

  async function handleSubmit() {
    if (!visitId) return;
    await submitQuestionnaire.mutateAsync(answers);
    navigation.goBack();
  }

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

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-center gap-3 mt-4 mb-5">
        <Feather
          name="chevron-left"
          size={24}
          color={colors.ink}
          onPress={() => navigation.goBack()}
        />
        <Text className="text-ink font-extrabold text-xl flex-1">Questionário</Text>
      </View>

      <Card className="gap-0.5 mb-4">
        {QUESTIONS.map((question, index) => (
          <View
            key={question.key}
            className={`flex-row items-center justify-between py-3 gap-3 ${
              index < QUESTIONS.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <Text className="text-ink text-sm flex-1">{question.label}</Text>
            <Switch
              value={answers[question.key]}
              onValueChange={(value) => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
              trackColor={{ false: colors.line, true: colors.brand }}
            />
          </View>
        ))}
      </Card>

      <Text className="text-ink font-bold text-base mb-2">Observações</Text>
      <Card className="mb-4">
        <TextInput
          value={answers.notes}
          onChangeText={(notes) => setAnswers((prev) => ({ ...prev, notes }))}
          placeholder="Observações sobre a visita (opcional)"
          placeholderTextColor={colors.inkMuted}
          multiline
          numberOfLines={4}
          className="text-ink text-sm min-h-[80px]"
          textAlignVertical="top"
        />
      </Card>

      {submitQuestionnaire.isError ? (
        <Text className="text-danger text-xs mb-3">
          Não foi possível salvar o questionário agora. Tente novamente.
        </Text>
      ) : null}

      <Button
        label="Salvar questionário"
        loading={submitQuestionnaire.isPending}
        onPress={handleSubmit}
      />
    </ScreenContainer>
  );
}
