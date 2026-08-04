// Configuração do Metro para Expo + NativeWind (Tailwind).
// Necessária para o NativeWind gerar/injetar o CSS do Tailwind no preview
// web (`npm run web`) — no nativo, o babel plugin (`nativewind/babel`,
// ver babel.config.js) já resolve as classes sozinho.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SDK 54 passou a resolver o campo "exports" dos pacotes (Node.js package
// exports). Para a plataforma web, isso faz o Metro ignorar a condição
// "react-native" do zustand (CJS, seguro) e cair na condição "import"/
// "module" (build ESM, que usa `import.meta.env` — sintaxe inválida quando
// empacotada como <script> comum, não módulo ES: "Cannot use 'import.meta'
// outside a module"). Desabilitar essa resolução volta ao campo "main"
// tradicional (CJS) em todas as plataformas — ver docs/DECISIONS.md, item 19.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });
