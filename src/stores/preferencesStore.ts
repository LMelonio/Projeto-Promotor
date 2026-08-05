import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Appearance = 'light' | 'dark' | 'auto';

export interface NotificationPreferences {
  addressApproval: boolean;
  visitReminders: boolean;
  appUpdates: boolean;
}

interface PreferencesState {
  appearance: Appearance;
  notifications: NotificationPreferences;
  setAppearance: (appearance: Appearance) => void;
  toggleNotification: (key: keyof NotificationPreferences) => void;
}

/**
 * Preferências do usuário (Perfil → Aparência/Notificações), persistidas em
 * `AsyncStorage` — ao contrário da sessão de auth (`authStore`), não guarda
 * nenhum dado sensível, então dispensa a criptografia usada em
 * `LargeSecureStore` (decisão nº 3).
 *
 * `appearance` só grava a preferência escolhida — ver `docs/DECISIONS.md`,
 * item 26, para o motivo de a troca de tema ainda não recolorir o app.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      appearance: 'light',
      notifications: {
        addressApproval: true,
        visitReminders: true,
        appUpdates: true,
      },
      setAppearance: (appearance) => set({ appearance }),
      toggleNotification: (key) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: !state.notifications[key] },
        })),
    }),
    {
      name: 'lynkz-promotor-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
