# Decisões Técnicas — Fase 1

Registro das escolhas feitas nesta fase, com alternativas consideradas e o motivo da rejeição. Objetivo: qualquer pessoa (ou eu mesmo, em uma sessão futura) entender "por que assim" sem precisar perguntar de novo.

---

### 1. Expo (managed) em vez de React Native CLI puro

**Escolhido**: Expo SDK 52.
**Alternativa considerada**: React Native CLI "bare", com linkagem manual de módulos nativos.
**Motivo**: o app precisa de câmera, GPS, biometria, SecureStore e notificações — todos disponíveis como módulos Expo oficiais, mantidos e testados em conjunto. Bare RN exigiria configurar cada um manualmente (Podfile, Gradle) e manter compatibilidade entre eles a cada upgrade. Para um time pequeno sem um mobile engineer dedicado full-time, o custo de manutenção do bare workflow não se paga. Se no futuro for necessário um módulo nativo que o Expo não cobre, o projeto pode migrar para "Expo prebuild" sem trocar de framework.

### 2. Supabase JS direto via Repository, sem camada GraphQL/REST própria

**Escolhido**: `@supabase/supabase-js` encapsulado em Repositories.
**Alternativa considerada**: expor uma API REST/GraphQL própria na frente do Postgres.
**Motivo**: o schema já foi desenhado com RLS (Row Level Security) fazendo o controle de acesso por promotor — construir uma API própria duplicaria essa lógica de autorização em dois lugares. O padrão Repository já isola a UI do SDK do Supabase; se um dia for necessário trocar por uma API própria, só a implementação dentro de `repositories/implementations` muda.

### 3. Sessão do Supabase Auth armazenada com criptografia própria (AES + SecureStore), não `AsyncStorage` puro

**Escolhido**: `LargeSecureStore` (chave AES-256 no Keychain/Keystore via `expo-secure-store`, blob criptografado no `AsyncStorage`).
**Alternativas consideradas**:
  a) `AsyncStorage` puro (recomendação mais simples da própria documentação do Supabase para RN).
  b) `expo-secure-store` puro.
**Motivo da rejeição de (a)**: `AsyncStorage` não é criptografado — em um aparelho comprometido/rooted, o token de sessão ficaria em texto plano. Dado que o app trafega dados comerciais sensíveis (faturamento, situação financeira de clientes), isso não atende ao requisito de proteção de dados sensíveis.
**Motivo da rejeição de (b)**: `expo-secure-store` tem limite de ~2048 bytes por valor; a sessão do Supabase (JWT + refresh token + metadata) costuma ultrapassar esse limite, causando falha silenciosa de persistência.
**Trade-off aceito**: mais uma dependência (`aes-js`) e ~60 linhas de código a mais do que usar `AsyncStorage` puro. Considerado aceitável dado o ganho de segurança.

### 4. Zustand + React Query, não Redux Toolkit nem Context API isolada

Ver justificativa detalhada em `docs/ARCHITECTURE.md`, seção "Gerenciamento de estado". Resumo: Redux traria boilerplate desproporcional ao tamanho do estado local (só sessão de auth); Context API sozinha não resolve cache/retry de dado remoto.

### 5. NativeWind fixado em `4.1.23` (não `^4.1.23`)

**Descoberto durante a validação desta fase**: a versão `4.2.x` do NativeWind atualizou sua dependência interna `react-native-css-interop`, que passou a referenciar incondicionalmente o plugin Babel `react-native-worklets/plugin` — pacote que exige `react-native-reanimated` v4 e React Native `0.83+`. Este projeto está em Expo 52 / RN 0.76 / Reanimated 3.16 (par estável e compatível com o restante do ecossistema Expo atual), então essa dependência quebrava o build de testes (`Cannot find module 'react-native-worklets/plugin'`).
**Decisão**: fixar a versão exata `4.1.23` (última antes dessa mudança) em vez de usar caret (`^`). **Ação futura**: ao planejar upgrade para Reanimated 4 (não necessário nesta fase), revisitar esse pin.

### 6. Ícones: Feather (via `@expo/vector-icons`), não um pacote Tabler para React Native

**Contexto**: o Design System aprovado especifica ícones estilo "Tabler (outline)". Não existe um pacote React Native oficial e mantido para o conjunto Tabler equivalente ao que já usamos para gerar assets nos entregáveis anteriores (Node/web).
**Escolhido**: `Feather` (via `@expo/vector-icons`, que já vem com o Expo — zero dependência nova). Visualmente é o set outline mais próximo de Tabler disponível de forma nativa e mantida no ecossistema RN (traço ~2px, estilo linear).
**Ação futura**: se a diferença visual entre Feather e Tabler for percebida como relevante depois de ver o app rodando em aparelho real, avaliar extrair os SVGs do Tabler (como já foi feito para os documentos de handoff) e gerar um pacote de ícones customizado via `react-native-svg` — mais trabalho, mas fidelidade visual exata.

### 7. `src/types/supabase.types.ts` manual e temporário

**Decisão consciente de não adivinhar nomes de coluna reais**. Em vez de tentar reproduzir de memória os nomes exatos das colunas das migrations já geradas em sessões anteriores (`lynkz_supabase/migrations/002_tables.sql` etc.), optei por declarar um tipo mínimo, claramente marcado como temporário, cobrindo só os campos que as telas desta fase usam. O caminho correto — documentado no `README.md` e no próprio arquivo — é gerar o tipo real com `supabase gen types typescript` assim que houver acesso ao projeto Supabase, e então reconciliar os Repositories. Adivinhar nomes agora criaria uma falsa sensação de "já integrado" que só quebraria mais tarde, de forma mais cara de depurar.

### 8. Fotos obrigatórias: câmera direta, não seleção de galeria (decisão para a Fase 3, registrada aqui por já ter sido levantada)

Ainda não implementado nesta fase, mas já decidido para não esquecer: as fotos de Atividades/Ruptura devem ser capturadas via `expo-camera` (captura ao vivo), não via `expo-image-picker` com acesso à galeria. Motivo: a integridade do dado enviado ao BI depende de a foto ser da visita real, não uma imagem qualquer selecionada depois — mesma preocupação de qualidade de dado já registrada nas decisões de produto anteriores do projeto.
