// Configuração do Metro para Expo + NativeWind (Tailwind).
// Necessária para o NativeWind gerar/injetar o CSS do Tailwind no preview
// web (`npm run web`) — no nativo, o babel plugin (`nativewind/babel`,
// ver babel.config.js) já resolve as classes sozinho.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
