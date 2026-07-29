import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Estado de erro reutilizável. Nunca exibimos mensagens técnicas cruas aqui
 * (stack trace, código HTTP) — apenas textos amigáveis já traduzidos pela
 * camada de Repository/Service. Isso segue o requisito de segurança de não
 * expor detalhes internos da aplicação ao usuário final.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-10">
      <Text className="text-ink text-center text-[15px]">{message}</Text>
      {onRetry ? <Button label="Tentar novamente" variant="ghost" onPress={onRetry} /> : null}
    </View>
  );
}
