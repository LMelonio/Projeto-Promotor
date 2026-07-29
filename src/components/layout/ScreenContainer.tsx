import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
}

/**
 * Wrapper padrão de tela: aplica safe area, fundo padrão (`surface-bg`) e,
 * opcionalmente, scroll. Usar em TODA tela nova em vez de `View` cru — evita
 * cada tela reimplementar o mesmo boilerplate de SafeAreaView/StatusBar.
 */
export function ScreenContainer({
  scroll = false,
  padded = true,
  className,
  children,
  ...viewProps
}: ScreenContainerProps) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-surface-bg" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Wrapper
        className={`flex-1 ${padded ? 'px-4' : ''} ${className ?? ''}`}
        {...(scroll ? { contentContainerClassName: padded ? 'pb-8' : undefined } : viewProps)}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}
