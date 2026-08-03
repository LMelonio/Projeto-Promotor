import type { ExpoConfig } from 'expo/config';

/**
 * Configuração dinâmica do Expo.
 *
 * Por que app.config.ts (e não app.json) — permite ler variáveis de
 * ambiente/EAS e centralizar as permissões nativas exigidas pelas telas já
 * aprovadas: Câmera (fotos obrigatórias de atividade/ruptura) e Localização
 * (check-in/check-out geolocalizado).
 */
const config: ExpoConfig = {
  name: 'Lynkz Promotor',
  slug: 'lynkz-promotor',
  scheme: 'lynkzpromotor',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'br.com.lynkz.promotor',
    infoPlist: {
      NSCameraUsageDescription:
        'A câmera é usada para registrar fotos obrigatórias de atividades e rupturas durante a visita.',
      NSLocationWhenInUseUsageDescription:
        'A localização é usada para confirmar o check-in e check-out no cliente visitado.',
      NSFaceIDUsageDescription:
        'Use Face ID para entrar no aplicativo com mais agilidade e segurança.',
    },
  },
  android: {
    package: 'br.com.lynkz.promotor',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    permissions: ['CAMERA', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission:
          'A câmera é usada para registrar fotos obrigatórias de atividades e rupturas durante a visita.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'A localização é usada para confirmar o check-in e check-out no cliente visitado.',
      },
    ],
    'expo-sqlite',
    'expo-font',
    'expo-asset',
  ],
  // `extra.eas.projectId` só deve ser adicionado quando houver um projeto EAS
  // real (`eas init`) — um placeholder aqui faz o Expo Go tentar validar o ID
  // contra os servidores da EAS ao conectar, o que exige login e quebra o
  // fluxo de desenvolvimento local sem motivo.
};

export default config;
