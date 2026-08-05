import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Linking, Pressable, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import type { PerfilStackParamList } from '@/navigation/types';
import { colors } from '@/theme';

/** Versão do app — mantida em sincronia manual com `app.config.ts`. */
const APP_VERSION = '0.1.0';
const SUPPORT_EMAIL = 'suporte@lynkzdistribuidora.com.br';
const SUPPORT_PHONE = '(99) 3524-0000';

/** Ajuda e sobre (wireframe de Perfil) — ver `docs/DECISIONS.md`, item 26. */
export function AjudaScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();

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
          Ajuda e sobre
        </Text>
      </View>

      <View className="items-center mb-6">
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 160, height: 62 }}
          contentFit="contain"
          accessibilityLabel="Lynkz Promotor"
        />
        <Text className="text-ink-muted text-xs mt-2">Versão {APP_VERSION}</Text>
      </View>

      <Text className="text-ink-muted text-xs font-bold mb-2 uppercase">Suporte</Text>
      <Card className="gap-0.5 mb-4">
        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          className="flex-row items-center gap-3 py-3 border-b border-line"
        >
          <Feather name="mail" size={18} color={colors.inkMuted} />
          <Text className="text-ink text-sm flex-1">{SUPPORT_EMAIL}</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE.replace(/\D/g, '')}`)}
          className="flex-row items-center gap-3 py-3"
        >
          <Feather name="phone" size={18} color={colors.inkMuted} />
          <Text className="text-ink text-sm flex-1">{SUPPORT_PHONE}</Text>
        </Pressable>
      </Card>

      <Text className="text-ink-muted text-xs text-center mt-2">
        Lynkz Promotor · {new Date().getFullYear()} · Todos os direitos reservados
      </Text>
    </ScreenContainer>
  );
}
