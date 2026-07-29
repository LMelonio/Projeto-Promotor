import 'react-native-gesture-handler';
import './global.css';

import { AppProviders } from '@/app/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Ponto de entrada do Lynkz Promotor.
 * Mantido deliberadamente enxuto: toda a lógica de fato mora em
 * `src/` (providers, navegação, telas). Este arquivo só compõe as peças.
 */
export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
