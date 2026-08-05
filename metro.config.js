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

// `expo-sqlite`'s implementação web (`expo-sqlite/web/worker.ts`) importa um
// binário `.wasm` (`wa-sqlite.wasm`) no topo do arquivo. Mesmo com o guard de
// `Platform.OS === 'web'` em `database/local/db.ts` (SQLite nunca é
// realmente usado no web — ver docs/DECISIONS.md, item 18), o Metro deste
// projeto não faz code-splitting de verdade em `import()` dinâmico: ele
// ainda percorre e resolve o grafo inteiro alcançável a partir dele. Sem
// ".wasm" na lista de extensões de asset, o Metro tenta interpretar o
// arquivo como código-fonte e falha ao bundlar para web inteiro (não só a
// funcionalidade de sync) — ver docs/DECISIONS.md, item 27.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
