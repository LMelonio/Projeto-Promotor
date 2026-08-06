# Decisões Técnicas

Registro das escolhas técnicas do projeto, com alternativas consideradas e o motivo da rejeição — objetivo: qualquer pessoa (inclusive eu mesmo, numa sessão futura) entender "por que assim" sem precisar perguntar de novo.

## Índice

**Fase 1**
1. [Expo (managed) em vez de React Native CLI puro](#d1)
2. [Supabase JS direto via Repository, sem camada GraphQL/REST própria](#d2)
3. [Sessão do Supabase Auth armazenada com criptografia própria (AES + SecureStore), não `AsyncStorage` puro](#d3)
4. [Zustand + React Query, não Redux Toolkit nem Context API isolada](#d4)
5. [NativeWind fixado em `4.1.23` (não `^4.1.23`)](#d5)
6. [Ícones: Feather (via `@expo/vector-icons`), não um pacote Tabler para React Native](#d6)
7. [`src/types/supabase.types.ts` manual e temporário](#d7)
8. [Fotos obrigatórias: câmera direta, não seleção de galeria (decisão para a Fase 3, registrada aqui por já ter sido levantada)](#d8)

**Fase 2**
9. ["Carteira de clientes" derivada de `visits`, sem tabela de atribuição própria](#d9)
10. [Colunas `checked_in_latitude`/`checked_in_longitude` em `visits` — assumidas, não confirmadas](#d10)
11. [Check-in sem visita agendada para hoje: bloqueado, não criado ad-hoc](#d11)

**Fase 3**
12. [Schema de Atividades/Questionário/Ruptura baseado em `Base App Promotor.xlsx`, não adivinhado](#d12)
13. [Fotos de Atividade ficam só no dispositivo nesta fase — upload real entra com a fila de sincronização (Fase 4)](#d13)

**Fase 4**
14. [Fila de sincronização offline: retry genérico por "tipo de ação", não por entidade](#d14)
15. ["Finalizar visita" (check-out) mora na aba Visita, não no Detalhe do Cliente](#d15)
16. [Histórico agrega contagem de Atividades/Fotos por consulta separada, não por coluna denormalizada](#d16)

**Testar o app de verdade pela primeira vez**
17. [Modo mock de dados fictícios (`useMockData` + `repositories/fakes/`)](#d17)
18. [Correções que só apareceram ao rodar o app de verdade (Expo Go + preview web)](#d18)
19. [Atualização para Expo SDK 54 (de 52)](#d19)
20. [`resolver.unstable_enablePackageExports = false` no `metro.config.js`](#d20)

**Reconciliação com a Documentação Funcional real**
21. [Atividades/Questionário/Ruptura reescritos — o catálogo da Fase 3 vinha de uma fonte errada](#d21)
22. [Tela de Check-out dedicada (resumo + motivo + resultado) — substitui o check-out direto de um toque](#d22)
23. [Model de Cliente enriquecido (CNPJ, e-mail, telefone, endereço, bairro, limite de crédito)](#d23)
24. [Tela de Check-in dedicada (relógio ao vivo + indicador de proximidade)](#d24)
25. [Histórico enriquecido (filtros de período, busca, sincronização por visita, rupturas, resultado da visita)](#d25)
26. [Perfil enriquecido (cargo/cidade, Alterar senha, Notificações, Aparência, Ajuda e sobre)](#d26)
27. [Notificações, banner de offline e recuperar senha — últimos gaps do comparativo](#d27)

**Feedback de uso real (usuário testou o app de verdade)**
28. [Check-in vai direto para Atividades, e a aba Clientes não fica mais travada num cliente](#d28)
29. [Modo escuro de verdade (CSS variables + `colorScheme` do NativeWind)](#d29)
30. [Positivação é contagem de clientes, não taxa](#d30)

**Criação do banco de dados**
31. [Schema real do Supabase criado do zero (`supabase/migrations/`)](#d31)
32. [Check-in via atalho da Home: `popToTop()` pulava para o cliente errado, não para a lista](#d32)

---

<a id="d1"></a>
### 1. Expo (managed) em vez de React Native CLI puro

**Escolhido**: Expo SDK 52.
**Alternativa considerada**: React Native CLI "bare", com linkagem manual de módulos nativos.
**Motivo**: o app precisa de câmera, GPS, biometria, SecureStore e notificações — todos disponíveis como módulos Expo oficiais, mantidos e testados em conjunto. Bare RN exigiria configurar cada um manualmente (Podfile, Gradle) e manter compatibilidade entre eles a cada upgrade. Para um time pequeno sem um mobile engineer dedicado full-time, o custo de manutenção do bare workflow não se paga. Se no futuro for necessário um módulo nativo que o Expo não cobre, o projeto pode migrar para "Expo prebuild" sem trocar de framework.

<a id="d2"></a>
### 2. Supabase JS direto via Repository, sem camada GraphQL/REST própria

**Escolhido**: `@supabase/supabase-js` encapsulado em Repositories.
**Alternativa considerada**: expor uma API REST/GraphQL própria na frente do Postgres.
**Motivo**: o schema já foi desenhado com RLS (Row Level Security) fazendo o controle de acesso por promotor — construir uma API própria duplicaria essa lógica de autorização em dois lugares. O padrão Repository já isola a UI do SDK do Supabase; se um dia for necessário trocar por uma API própria, só a implementação dentro de `repositories/implementations` muda.

<a id="d3"></a>
### 3. Sessão do Supabase Auth armazenada com criptografia própria (AES + SecureStore), não `AsyncStorage` puro

**Escolhido**: `LargeSecureStore` (chave AES-256 no Keychain/Keystore via `expo-secure-store`, blob criptografado no `AsyncStorage`).
**Alternativas consideradas**:
  a) `AsyncStorage` puro (recomendação mais simples da própria documentação do Supabase para RN).
  b) `expo-secure-store` puro.
**Motivo da rejeição de (a)**: `AsyncStorage` não é criptografado — em um aparelho comprometido/rooted, o token de sessão ficaria em texto plano. Dado que o app trafega dados comerciais sensíveis (faturamento, situação financeira de clientes), isso não atende ao requisito mínimo de proteção de dados.
**Motivo da rejeição de (b)**: `expo-secure-store` tem limite de ~2048 bytes por valor; a sessão do Supabase (JWT + refresh token + metadata) costuma ultrapassar esse limite, causando falha silenciosa de persistência.
**Trade-off aceito**: mais uma dependência (`aes-js`) e ~60 linhas de código a mais do que usar `AsyncStorage` puro. Considerado aceitável dado o ganho de segurança.

<a id="d4"></a>
### 4. Zustand + React Query, não Redux Toolkit nem Context API isolada

Ver justificativa detalhada em `docs/ARCHITECTURE.md`, seção "Gerenciamento de estado". Resumo: Redux traria boilerplate desproporcional ao tamanho do estado local (só sessão de auth); Context API sozinha não resolve cache/retry de dado remoto.

<a id="d5"></a>
### 5. NativeWind fixado em `4.1.23` (não `^4.1.23`)

**Descoberto durante a validação desta fase**: a versão `4.2.x` do NativeWind atualizou sua dependência interna `react-native-css-interop`, que passou a referenciar incondicionalmente o plugin Babel `react-native-worklets/plugin` — pacote que exige `react-native-reanimated` v4 e React Native `0.83+`. Este projeto está em Expo 52 / RN 0.76 / Reanimated 3.16 (par estável e compatível com o restante do ecossistema Expo atual), então essa dependência quebrava o build de testes (`Cannot find module 'react-native-worklets/plugin'`).
**Decisão**: fixar a versão exata `4.1.23` (última antes dessa mudança) em vez de usar caret (`^`). **Ação futura**: ao planejar upgrade para Reanimated 4 (não necessário nesta fase), revisitar esse pin.

<a id="d6"></a>
### 6. Ícones: Feather (via `@expo/vector-icons`), não um pacote Tabler para React Native

**Contexto**: o Design System aprovado especifica ícones estilo "Tabler (outline)". Não existe um pacote React Native oficial e mantido para o conjunto Tabler equivalente ao que já usamos para gerar assets nos entregáveis anteriores (Node/web).
**Escolhido**: `Feather` (via `@expo/vector-icons`, que já vem com o Expo — zero dependência nova). Visualmente é o set outline mais próximo de Tabler disponível de forma nativa e mantida no ecossistema RN (traço ~2px, estilo linear).
**Ação futura**: se a diferença visual entre Feather e Tabler for percebida como relevante depois de ver o app rodando em aparelho real, avaliar extrair os SVGs do Tabler (como já foi feito para os documentos de handoff) e gerar um pacote de ícones customizado via `react-native-svg` — mais trabalho, mas fidelidade visual exata.

<a id="d7"></a>
### 7. `src/types/supabase.types.ts` manual e temporário

**Decisão consciente de não adivinhar nomes de coluna reais**. Em vez de tentar reproduzir de memória os nomes exatos das colunas das migrations já geradas em sessões anteriores (`lynkz_supabase/migrations/002_tables.sql` etc.), optei por declarar um tipo mínimo, claramente marcado como temporário, cobrindo só os campos que as telas desta fase usam. O caminho correto — documentado no `README.md` e no próprio arquivo — é gerar o tipo real com `supabase gen types typescript` assim que houver acesso ao projeto Supabase, e então reconciliar os Repositories. Adivinhar nomes agora criaria uma falsa sensação de "já integrado" que só quebraria mais tarde, de forma mais cara de depurar.

<a id="d8"></a>
### 8. Fotos obrigatórias: câmera direta, não seleção de galeria (decisão para a Fase 3, registrada aqui por já ter sido levantada)

Ainda não implementado nesta fase, mas já decidido para não esquecer: as fotos de Atividades/Ruptura devem ser capturadas via `expo-camera` (captura ao vivo), não via `expo-image-picker` com acesso à galeria. Motivo: a integridade do dado enviado ao BI depende de a foto ser da visita real, não uma imagem qualquer selecionada depois — mesma preocupação de qualidade de dado já registrada nas decisões de produto anteriores do projeto.

---

## Decisões Técnicas — Fase 2

<a id="d9"></a>
### 9. "Carteira de clientes" derivada de `visits`, sem tabela de atribuição própria

**Escolhido**: `ClientRepository.listPortfolio` busca todo cliente com pelo menos uma visita (passada ou futura) registrada para o promotor autenticado, na tabela `visits` — mesmo padrão já usado em `DashboardRepository.getTodayRoute`.
**Alternativa considerada**: uma tabela explícita `promoter_clients` (atribuição fixa de carteira).
**Motivo**: nenhuma migration conhecida até agora expõe essa tabela — inventar seu nome/formato repetiria o erro que a decisão nº 7 já evita para `supabase.types.ts`. Como `visits` já carrega o vínculo promotor↔cliente (usado desde a Fase 1 na Home), reaproveitá-lo é a opção que não exige adivinhar schema novo.
**Ação futura**: se as migrations reais tiverem uma tabela de atribuição fixa (carteira independente de visita já ter ocorrido), revisar `listPortfolio` para consultá-la diretamente — hoje um cliente sem nenhuma visita agendada nunca aparece na lista.

<a id="d10"></a>
### 10. Colunas `checked_in_latitude`/`checked_in_longitude` em `visits` — assumidas, não confirmadas

**Contexto**: o check-in georreferenciado (Fase 2) precisa persistir a coordenada capturada no momento do toque, e a tabela `visits` só tinha, no tipo manual herdado da Fase 1, `checked_in_at`.
**Escolhido**: adicionar `checked_in_latitude`/`checked_in_longitude` (nullable) ao tipo manual de `visits` em `src/types/supabase.types.ts`, marcadas com comentário de "assumido, reconciliar ao gerar tipos reais" — mesmo espírito da decisão nº 7.
**Ação futura**: ao rodar `npm run gen:types`, confirmar se as migrations reais usam esses nomes (ou, por exemplo, um único campo `geography`/PostGIS) e ajustar `ClientRepository.checkIn` de acordo.

<a id="d11"></a>
### 11. Check-in sem visita agendada para hoje: bloqueado, não criado ad-hoc

**Escolhido**: a tela de Detalhe do Cliente só oferece "Iniciar check-in" quando já existe uma visita com `status = 'scheduled'` para o cliente na data de hoje. Sem visita, mostra apenas "Nenhuma visita agendada para hoje com este cliente." — não cria uma visita nova on-the-fly.
**Motivo**: criar uma visita ad-hoc é uma decisão de produto (mudaria o roteiro planejado, afetaria KPIs de aderência ao roteiro) que não foi pedida para esta fase — o escopo aprovado é "início do Check-in" sobre visitas já existentes. Melhor deixar explícito e bloqueado do que inventar um comportamento novo sem validação.
**Ação futura**: se o produto decidir permitir visita não planejada, tratar como uma feature nova (com sua própria tela/confirmação), não como uma alteração silenciosa deste fluxo.

---

## Decisões Técnicas — Fase 3

<a id="d12"></a>
### 12. Schema de Atividades/Questionário/Ruptura baseado em `Base App Promotor.xlsx`, não adivinhado

**Contexto**: ao contrário das Fases 1 e 2 (onde não havia nenhuma fonte confiável para os nomes de tabela/coluna, ver decisão nº 7), foi localizada ao lado do projeto (`Desktop/Projeto Promotor/Base App Promotor.xlsx`, fora deste repositório Git) uma planilha funcional com abas `Produtos`, `CarteiraProdutos`, `Atividades`, `Questionarios` e `Rupturas` — dados de exemplo com as colunas exatas do domínio que esta fase precisa modelar.
**Escolhido**: usar essa planilha como fonte de verdade para **quais campos existem e seu significado de negócio** (ex.: `Atividades` tem `Tipo_Atividade`, `Status`, `Quantidade_Fotos`, `Observacoes`; `Rupturas` não tem `Visita_ID` nem `Promotor_ID` — é uma falta de produto associada só a Cliente+Produto). Os nomes de coluna em `src/types/supabase.types.ts`, porém, continuam traduzidos para o padrão inglês/snake_case já usado nas tabelas de Fases anteriores (`activities`, `questionnaires`, `rupturas`, `products`, `promoter_products`), e os enums (`ActivityType`, `RupturaStatus`) usam chaves em inglês com label em português na UI — mesmo padrão de `FinancialStatus`/`VisitStatus`, para manter o código internamente consistente em vez de misturar convenções.
**Catálogo fixo assumido**: os seis tipos de atividade (`Instalação de materiais`, `Treinamento`, `Organização de gôndola`, `Precificação`, `Ação promocional`, `Reposição`) e os dois status de ruptura (`Pendente`/`Resolvida`) vêm direto dos valores distintos observados na planilha. Já `ActivityStatus` inclui `pending`, que não aparece nos dados de exemplo (toda atividade amostrada já está `Concluída`) — assumido por simetria com o fluxo de check-in.
**Ação futura**: mesmo aviso da decisão nº 7 — reconciliar contra migrations reais ao rodar `npm run gen:types`. Além disso, essa planilha revelou uma tabela `CarteiraClientes` (Promotor_ID/Cliente_ID/Status) que parece ser exatamente a "tabela de atribuição fixa de carteira" que a decisão nº 9 (Fase 2) já previa como possível — vale revisitar `ClientRepository.listPortfolio` num ciclo futuro à luz disso.

<a id="d13"></a>
### 13. Fotos de Atividade ficam só no dispositivo nesta fase — upload real entra com a fila de sincronização (Fase 4)

**Escolhido**: `ActivityCameraModal` captura as fotos ao vivo (decisão nº 8) e a tela registra apenas a **contagem** (`photo_count`) junto da atividade — os binários não são enviados ao Supabase Storage nesta fase.
**Alternativa considerada**: fazer upload direto para um bucket do Storage a cada foto capturada.
**Motivo**: `docs/ARCHITECTURE.md` já reserva explicitamente "fila de sincronização offline (SQLite + services/sync)" para a Fase 4, exatamente por causa da rede instável em campo — implementar upload síncrono de imagem agora duplicaria esse esforço e criaria um caminho de falha (visita sem internet) que a Fase 4 é quem deve resolver de verdade. Também exigiria assumir o nome de um bucket de Storage sem confirmação, repetindo o risco da decisão nº 7.
**Ação futura**: ao implementar a fila de sincronização da Fase 4, incluir o envio dos binários de foto (hoje descartados após a contagem) como parte do mesmo mecanismo.

---

## Decisões Técnicas — Fase 4

<a id="d14"></a>
### 14. Fila de sincronização offline: retry genérico por "tipo de ação", não por entidade

**Escolhido**: uma única tabela SQLite `sync_queue` (`database/local/db.ts`) guarda `{id, kind, payload, created_at, attempts, last_error}`; `services/sync/syncEngine.ts` mantém um mapa `SYNC_HANDLERS: Record<SyncKind, (payload) => Promise<...>>` com um handler por tipo de escrita (`check_in`, `check_out`, `register_activity`, `submit_questionnaire`, `register_ruptura`). `runOrQueue(kind, payload)` tenta a chamada real primeiro; se falhar por qualquer motivo, enfileira o mesmo payload — não distingue "sem internet" de outros erros de rede, porque em campo esse é o cenário dominante e as validações client-side (coordenadas obtidas, foto ≥ 1, quantidade > 0) já reduzem bastante a chance de um payload inválido chegar até aqui.
**Alternativa considerada**: uma fila/tabela específica por entidade (ex.: `pending_checkins`, `pending_activities`).
**Motivo da escolha**: um único mecanismo de retry (mesma tabela, mesmo loop de `flushQueue`) é mais simples de raciocinar e testar do que N filas paralelas, e novos tipos de ação offline só precisam de uma entrada nova em `SYNC_HANDLERS` — não de uma tabela nova.
**Timestamp de captura, não de sincronização**: `checkIn`/`checkOut` passaram a receber `occurredAt` explícito do chamador (em vez de gerar `new Date()` dentro do Repository) — se a ação ficar enfileirada por horas até haver sinal, o horário gravado no servidor precisa refletir o momento real do check-in/check-out, não o momento em que o app finalmente conseguiu enviar. `registerRuptura` recebeu o mesmo tratamento (`reportedAt` em `NewRupturaInput`).
**Simplificação aceita conscientemente**: quando uma ação é enfileirada offline, o cache do React Query é corrigido otimisticamente só onde a tela já dependia diretamente daquele estado (checklist de Atividades, badge do Questionário, status da visita em `today-visit`/`active-visit`) — a lista "Rupturas deste cliente" **não** recebe patch otimista, só aparece após sincronizar de verdade (`useRegisterRuptura` em `useVisitaData.ts`). Fazer isso também exigiria inventar um id local e um status "pendente de sincronização" só para essa lista, para um caso de uso secundário (revisão de rupturas já registradas) — não parece valer o custo agora.
**Ação futura**: os binários das fotos de Atividade (decisão nº 13) **continuam não sincronizados** nesta fase — a fila lida com dados estruturados (JSON), não com arquivos. Adicionar isso exigiria decidir um bucket/caminho de Storage (ainda não confirmado, mesmo risco da decisão nº 7) e uma estratégia de payload maior (base64 em SQLite tem custo de espaço/performance real) — fica registrado como próximo passo, não escondido.

<a id="d15"></a>
### 15. "Finalizar visita" (check-out) mora na aba Visita, não no Detalhe do Cliente

**Escolhido**: o botão de check-out fica no topo de `VisitaScreen` (o "hub" da visita em andamento desde a Fase 3), não em `ClienteDetalheScreen` — que ganhou só um atalho "Ir para Visita" enquanto a visita está em andamento, e um resumo (horário + duração) quando já concluída.
**Alternativa considerada**: manter check-in E check-out simétricos, os dois em `ClienteDetalheScreen` (onde o check-in já vive desde a Fase 2).
**Motivo**: depois que o check-in acontece, o fluxo do promotor migra para a aba Visita (Atividades/Questionário/Ruptura) — pedir para ele voltar para Clientes só para encerrar a visita que está acompanhando na outra aba criaria uma navegação de ida e volta desnecessária. Check-in continua em Detalhe do Cliente porque é o ponto de partida natural (decisão de produto da Fase 2, não revisada aqui).

<a id="d16"></a>
### 16. Histórico agrega contagem de Atividades/Fotos por consulta separada, não por coluna denormalizada

**Escolhido**: `HistoryRepository.listCompletedVisits` busca `visits` (status `completed`) e depois `activities` filtradas por `visit_id in (...)`, agregando contagem e soma de `photo_count` em memória — não existe (nem foi assumida) uma coluna `quantidade_atividades`/`quantidade_fotos` na tabela `visits`, mesmo a planilha de referência (decisão nº 12) tendo essas colunas em `HistoricoVisitas`.
**Motivo**: essas colunas, na planilha, parecem ser um resumo pré-calculado (típico de export de BI) — mantê-las como dado derivado (agregado a partir de `activities`, que já existe e é a fonte real) evita um segundo lugar para desincronizar caso uma atividade seja adicionada/editada depois do check-out.

---

## Decisões — testar o app de verdade pela primeira vez

Até aqui, "validação" significava `typecheck`/`lint`/`test`. Nenhum deles exercita o Metro bundler nem um dispositivo/navegador real — então vários problemas reais só apareceram quando o app foi de fato executado (Expo Go e depois preview web). Registrados aqui porque nenhum é óbvio a partir do código sozinho.

<a id="d17"></a>
### 17. Modo mock de dados fictícios (`useMockData` + `repositories/fakes/`)

**Contexto**: o app nunca teve um projeto Supabase real conectado (nenhuma fase anterior teve acesso a isso, e a pasta `lynkz_supabase/migrations/` citada desde a Fase 1 não existe em nenhum lugar acessível). Sem isso, o app não consegue nem inicializar — e criar um projeto Supabase real ficou para uma etapa futura.
**Escolhido**: se **nenhuma** das duas envs do Supabase estiver definida, `src/config/env.ts` ativa `useMockData = true`, e cada `implementations/*Repository.ts` exporta uma implementação fictícia de `repositories/fakes/` em vez da real — nenhuma tela precisa saber disso, ambas satisfazem a mesma interface (`IAuthRepository`, `IClientRepository` etc., exatamente o benefício que `docs/ARCHITECTURE.md` já previa para essa camada desde a Fase 1). Os dados fictícios (`fakeStore.ts`) reaproveitam nomes/coordenadas da planilha de referência (decisão nº 12) para parecerem realistas, e mutações (check-in, atividade, ruptura...) alteram um estado em memória compartilhado, então o app reage de verdade a interações dentro da mesma sessão.
**Alternativa considerada**: preencher `.env` com valores fictícios só para passar da checagem de `requireEnv`. Rejeitada — o app chegaria a abrir a tela de Login, mas login/dashboard/tudo mais continuaria quebrado (erro de rede contra uma URL falsa), não permitindo testar o fluxo de verdade.
**Configuração parcial**: se só uma das duas envs estiver definida (config real pela metade), `useMockData` continua `false` e o erro original de `requireEnv` continua disparando — isso é config quebrada de verdade, não modo mock intencional.
**Ação futura**: ao conectar um Supabase real, basta preencher `.env` — nenhum código muda, o switch é automático.

<a id="d18"></a>
### 18. Correções que só apareceram ao rodar o app de verdade (Expo Go + preview web)

Lista curta, cada uma descoberta ao efetivamente iniciar o Metro bundler e abrir o app num cliente real — nenhuma aparecia em `typecheck`/`lint`/`test`:

- **`expo-asset`/`expo-font` ausentes do `node_modules`** e 4 pacotes desalinhados com o SDK 52 — instalação incompleta desde a Fase 1, só travava o `expo start`. Corrigido com `npx expo install --fix`.
- **`assets/icon.png`/`splash.png`/`adaptive-icon.png` nunca existiam** (só `logo.png`) — `app.config.ts` referenciava arquivos inexistentes; só quebra ao um dispositivo real buscar o manifesto (fallback exige login numa conta EAS). Gerados a partir do logo existente.
- **`extra.eas.projectId` com placeholder literal** (`"PREENCHER_APOS_CRIAR_PROJETO_EAS"`) fazia o Expo tentar validar esse ID contra os servidores da EAS ao conectar um cliente real, também caindo no mesmo fluxo de login. Removido — só deve voltar com um projectId real, ao rodar `eas init`.
- **`@opentelemetry/api` ausente** — `@supabase/supabase-js` tenta importar isso dinamicamente (telemetria opcional, `.catch(() => null)` em runtime); o bundler Metro (diferente de webpack/vite) resolve `import()` estaticamente e quebra o bundle **web** sem essa dependência instalada. Instalada como dependência direta, mesmo nunca sendo usada.
- **Módulos nativos que chamam `requireNativeModule(...)` no escopo do módulo** (não dentro de uma função) — `expo-sqlite`, `expo-secure-store`, `expo-crypto`, `expo-camera`, `expo-location`, `expo-local-authentication` fazem isso. Um `import` estático de qualquer um deles quebra o carregamento do bundle inteiro em **web** (plataforma sem os bindings nativos), mesmo que nenhuma função do módulo seja chamada. Corrigido de forma pontual onde já bloqueava o app inteiro: `database/local/db.ts` (fila de sincronização) usa import dinâmico + guard `Platform.OS==='web'` nos chamadores (`useAutoSync`, `useSyncStatus`); `lastKnownUser.ts` (SecureStore) ganhou try/catch, já que é só uma saudação cosmética. **Não** foi feito o mesmo para `expo-camera`/`expo-location`/`expo-local-authentication` — funcionam perfeitamente em dispositivo real (Expo Go), e aplicar esse mesmo tratamento a todos seria um retrofit bem maior para uma plataforma (web) que nunca foi o alvo do projeto (ver stack em `README.md`). Se o preview web precisar tocar câmera/GPS/biometria no futuro, aplicar o mesmo padrão.
- **`metro.config.js` nunca existia** — NativeWind v4 precisa dele (`withNativeWind`) para gerar/injetar o CSS do Tailwind especificamente no bundle **web**; sem isso, o app renderizava sem estilo nenhum (HTML "cru"). Adicionado; sem efeito no nativo, que já resolve as classes via `nativewind/babel` (`babel.config.js`).

**Conclusão prática**: `typecheck`/`lint`/`test` continuam necessários mas não são suficientes para saber se o app "roda" — vale rodar `npx expo start` (ou o preview web) pelo menos uma vez por fase daqui pra frente.

<a id="d19"></a>
### 19. Atualização para Expo SDK 54 (de 52)

**Contexto**: o Expo Go instalado por um usuário novo vem sempre na versão mais recente da loja (SDK 54 no momento desta atualização) — só existe UMA versão publicada por vez, não dá pra "instalar uma mais antiga" pela Play Store/App Store. Tentar abrir este projeto (SDK 52) com esse Expo Go falha com `Project is incompatible with this version of Expo Go`.
**Alternativas consideradas**: (a) pedir para o usuário baixar um Expo Go antigo via sideload (só existe para Android, exige habilitar instalação de fontes desconhecidas); (b) manter o projeto no SDK 52 e usar só o preview web daqui pra frente.
**Escolhido**: atualizar o projeto para SDK 54 (`npx expo install expo@^54.0.0` + `npx expo install --fix`, reinstalação limpa de `node_modules`/lockfile por causa do tamanho do salto de versão) — resolve de vez para qualquer usuário futuro que instale o Expo Go hoje, em vez de deixar o projeto preso a uma versão cada vez mais difícil de testar.
**O que mudou**: React 18→19, React Native 0.76→0.81, Reanimated 3.16→4.1 (agora exige `react-native-worklets` como peer dependency direta — a preocupação da decisão nº 5 sobre evitar essa dependência não se aplica mais, o próprio SDK 54 já exige), `@testing-library/react-native` 12→14 (só a v14 suporta React 19; também exigiu atualizar o `overrides.react-test-renderer` de `18.3.1` para `19.1.0` em `package.json`), `jest-expo` 52→54, e mais uma dependência que faltava no `node_modules` (`babel-preset-expo`, mesma categoria de instalação incompleta já vista na decisão nº 18).
**Regressão temporária, já corrigida (ver item 20)**: o preview web parou de carregar logo após esta atualização (`Cannot use 'import.meta' outside a module`) — não afetava o Expo Go em dispositivo físico.

<a id="d20"></a>
### 20. `resolver.unstable_enablePackageExports = false` no `metro.config.js`

**Contexto**: depois da atualização para SDK 54 (decisão nº 19), o preview web parou de carregar com `Cannot use 'import.meta' outside a module`. Rastreando a origem exata dentro do bundle (procurando o texto literal nos módulos gerados), o erro não vinha de código deste projeto — vinha do build ESM do **zustand** (`esm/index.mjs`, que usa `import.meta.env.MODE` para um aviso de depreciação).
**Causa raiz**: o `package.json` do zustand declara um campo `exports` com condições diferentes por ambiente (`"react-native"` → CJS seguro, `"import"`/`"module"` → ESM com `import.meta`). O `@expo/metro-config` do SDK 54 passou a resolver esse campo `exports` — e para a plataforma **web**, a condição `"react-native"` não se aplica, então o Metro cai na condição `"import"`, pegando o build ESM. Só que o Metro empacota tudo como `<script>` comum (não módulo ES de verdade), então `import.meta` vira erro de sintaxe. No SDK 52, essa resolução de `exports` não acontecia (ou não do mesmo jeito), então o problema nunca apareceu.
**Escolhido**: `config.resolver.unstable_enablePackageExports = false` em `metro.config.js` — desativa a resolução do campo `exports` e volta para o campo `main` tradicional (sempre CJS) em qualquer pacote, em qualquer plataforma, incluindo o zustand.
**Alternativas consideradas**: (a) trocar de biblioteca de estado — descartada, não é um problema do zustand em si, é resolução de módulo; (b) mockar/alias só o zustand no resolver — mais frágil e específico, essa flag resolve a causa raiz para qualquer pacote que tenha o mesmo padrão de `exports` no futuro.
**Confirmado**: preview web voltou a carregar e logar normalmente (mesmos testes de tela feitos nas decisões anteriores), typecheck/lint/test seguem limpos.

---

## Decisões — reconciliação com a Documentação Funcional real

O usuário enviou `Documentacao_Funcional_Lynkz_Promotor.pdf` — a especificação real do app, com wireframes de todas as 14 telas. Comparando contra o código, vários gaps apareceram (ver o comparativo publicado como artefato na conversa); o maior está registrado abaixo.

<a id="d21"></a>
### 21. Atividades/Questionário/Ruptura reescritos — o catálogo da Fase 3 vinha de uma fonte errada

**Contexto**: a Fase 3 modelou "Atividades" como um catálogo fixo de 6 tipos genéricos (Instalação de materiais, Treinamento, Organização de gôndola, Precificação, Ação promocional, Reposição), com Questionário e Ruptura como fluxos totalmente separados — tudo baseado na planilha `Base App Promotor.xlsx` (decisão nº 12), que era a única fonte disponível na época. A Documentação Funcional real mostra uma estrutura diferente: "Atividades" é uma lista de **4 itens**, com barra de progresso, onde **Questionário de PDV** e **Registro de ruptura** são dois desses itens (abrindo cada um seu próprio sub-fluxo ao serem tocados), junto de "Fotos da gôndola" e um 4º item.
**Escolhido**: substituir o catálogo antigo por `ActivityKind` = `'questionnaire' | 'photos' | 'price_check' | 'ruptura'`, com `ACTIVITY_CHECKLIST` definindo label/obrigatoriedade de cada um (`models/Activity.ts`). `VisitaScreen` virou o checklist único com barra de progresso e "Finalizar visita" (que já morava ali, decisão nº 15) gated pelos itens obrigatórios.
**4º item assumido**: o wireframe do PDF corta antes de mostrar o 4º item da lista (só "Questionário de PDV", "Fotos da gôndola" e "Registro de ruptura" aparecem no print, mas o texto diz "1 de 4 concluídas"/"conclua 2 atividades obrigatórias"). Escolhi **"Verificação de preços"** como placeholder — mandatório, sem sub-tela própria (só um toque marca como concluído, já que não há wireframe nenhum para basear uma UI mais elaborada). Reconciliar se a especificação real tiver um nome/fluxo diferente para esse item.
**Questionário**: reescrito de 4 perguntas Sim/Não numa tela só para um assistente passo a passo — 8 perguntas, uma por vez, múltipla escolha (4 alternativas), "Anterior/Próxima" (`models/Questionnaire.ts`, `QuestionarioScreen.tsx`). Só a pergunta nº 3 (texto + alternativas) aparece no wireframe; as outras 7 foram escritas no mesmo espírito (checklist de PDV) para fechar o assistente — reconciliar textos/ordem se divergir da especificação real. Armazenamento mudou de colunas booleanas fixas para `Record<questionId, opçãoEscolhida>` (`questionnaires.answers`, jsonb).
**Fotos**: nova tela dedicada `FotosAtividadeScreen` com grade de miniaturas reais (a foto capturada agora é mantida em memória como URI, não só contada — `ActivityCameraModal` passou a devolver as URIs) e contador "X de 3". Sem status de sincronização por foto — os binários continuam sem subir para o Storage remoto (decisão nº 13), então um selo "Sincronizado" por foto seria enganoso.
**Ruptura**: ganhou leitura de código EAN via câmera (`EanScannerModal`, usando `barcodeScannerSettings` do `expo-camera`), campo de gravidade (`RupturaSeverity`: "Ruptura total" / "Estoque baixo") e foto obrigatória (reaproveitando `ActivityCameraModal`).
**Descoberta útil**: ao testar no preview web, `expo-camera` funciona perfeitamente via `getUserMedia` do navegador (webcam) — ao contrário de `expo-sqlite`/`expo-secure-store`/`expo-crypto` (decisão nº 18), não precisou de nenhum guard `Platform.OS === 'web'`.
**Ação futura**: as próximas telas da Documentação Funcional (Check-out com resumo/motivo/resultado, Cliente com CNPJ/endereço/limite de crédito, Check-in dedicado com mapa, Histórico com filtros, Perfil completo, Notificações) ainda não foram atacadas — ver o comparativo completo publicado na conversa para o restante do plano.

<a id="d22"></a>
### 22. Tela de Check-out dedicada (resumo + motivo + resultado) — substitui o check-out direto de um toque

**Contexto**: a Fase 4 tratava "Finalizar visita" como uma ação direta — um toque no botão já disparava GPS + `checkOut` sem nenhuma confirmação intermediária. O wireframe real ("10-Check-out") mostra uma tela própria: resumo da visita (duração, atividades concluídas, fotos, rupturas), seleção de **motivo da visita** e **resultado da visita**, só então o botão de confirmação.
**Escolhido**: nova `CheckoutScreen.tsx`, navegada a partir de "Finalizar visita" em `VisitaScreen` (que passou a só navegar, não mais chamar `checkOut` diretamente). `Visit.ts` ganhou `VisitReason` (`sale`/`training`/`routine`/`audit`) e `VisitOutcome` (`completed`/`client_absent`/`closed`); `checkOut` no repositório passou de 3 argumentos posicionais para um único objeto de entrada (`{ visitId, coords, occurredAt, reason, outcome }`) — mudança propagada por `IClientRepository`, `ClientRepository`, `FakeClientRepository`, `fakeStore` (campo `reason`/`outcome` nos assentos de visita seed) e `syncEngine`.
**Motivo/Resultado assumidos**: só "Venda" (motivo) e "Visita concluída"/"Cliente ausente" (resultado) são confirmados pelo wireframe; os demais valores (`training`, `routine`, `audit`, `closed`) são extensões razoáveis — parte já vista na planilha de referência (decisão nº 12). Reconciliar se a especificação real tiver uma lista diferente.
**Contagem de rupturas no resumo — aproximação assumida**: `Ruptura` não guarda `visitId` (só `clientId`/`reportedAt`), então o resumo conta rupturas do cliente com `reportedAt >= checkedInAt` da visita ativa como proxy. Se o promotor tiver duas visitas no mesmo cliente no mesmo dia (raro), a contagem pode incluir rupturas de uma visita anterior já finalizada — aceitável dado o baixo risco e a ausência de um vínculo direto no schema atual.
**Bug real encontrado e corrigido durante o teste end-to-end (Playwright)**: `submitQuestionnaire` e `registerRuptura` nunca registravam uma `Activity` correspondente (`kind: 'questionnaire'` / `kind: 'ruptura'`) — só gravavam os dados específicos (respostas/ruptura), e o checklist de `VisitaScreen` lê exclusivamente da lista de `Activity`. Resultado: o item "Questionário de PDV" (obrigatório) nunca virava "Concluída", travando `Finalizar visita` para sempre. Corrigido chamando `registerActivity` logo após o sucesso de `submitQuestionnaire` (`QuestionarioScreen`) e, no caso de ruptura (opcional, pode ser registrada mais de uma vez por visita), só na primeira ruptura da visita (`RupturaScreen`, guardado por `hasRupturaActivity` checado contra `useActivities`) — evita inserir múltiplas linhas de `Activity` para o mesmo item de checklist.
**Confirmado**: fluxo completo testado via Playwright no preview web — login → check-in → checklist (verificação de preços, questionário de 8 perguntas, 3 fotos via webcam) → "Finalizar visita" habilitado → Check-out mostra resumo correto (3 de 4 atividades, 3 fotos, 0 rupturas) → seleção de motivo/resultado → confirmação → visita encerrada e aba Visita volta a "Nenhuma visita em andamento". typecheck/lint/test (18/18) limpos.

<a id="d23"></a>
### 23. Model de Cliente enriquecido (CNPJ, e-mail, telefone, endereço, bairro, limite de crédito)

**Contexto**: o wireframe "4-Detalhes do Cliente" mostra um cliente com bem mais informação do que o model atual guardava — CNPJ, e-mail, telefone, endereço completo com "Ver no Google Maps", bairro (também usado no card da lista, "Cód. 4921 · Aldeota") e limite de crédito, organizados em seções "Informações"/"Endereço"/"Financeiro".
**Escolhido**: `Client` (`models/Client.ts`) ganhou `cnpj`, `email`, `phone`, `address`, `neighborhood`, `city`, `state`, `creditLimit`. Como `ClientListItem extends Client`, o card da lista (`ClientCard`) ganhou o bairro de graça ("Cód. ERP20001 · Centro"). `ClientesScreen` ganhou um contador "N na carteira" no cabeçalho e busca por CNPJ além de nome/código. `ClienteDetalheScreen` ganhou as três seções do wireframe: Informações (e-mail/telefone), Endereço (logradouro/bairro/cidade-UF + "Ver no Google Maps", que abre `https://www.google.com/maps/search/?api=1&query={lat},{lng}` via `Linking.openURL`) e Financeiro (situação + limite de crédito formatado em BRL).
**"Histórico de ações" — conteúdo assumido**: a documentação cita esse link sem detalhar o que ele deveria mostrar (marcado como "vale perguntar" no comparativo). Implementado como um link que navega para a aba **Histórico** existente (sem filtro por cliente ainda) — melhor que não ter nenhuma ação, mas incompleto: o ideal seria abrir o Histórico já filtrado para este cliente. Como o Grupo 5 (ainda não atacado) já planeja adicionar "busca por cliente" ao Histórico, a filtragem automática a partir daqui fica adiada para reaproveitar aquela mesma implementação, em vez de duplicar lógica de filtro agora para depois substituir.
**Dados fictícios**: os 5 clientes seed do modo mock (`fakeStore.ts`) ganharam CNPJ/e-mail/telefone/endereço/bairro/cidade/UF/limite de crédito plausíveis (cidades da região Tocantins/Maranhão/Pará, coerente com as coordenadas já existentes) — mesma natureza "dados fictícios" dos demais dados de exemplo do projeto.
**Confirmado**: testado via Playwright — lista mostra "5 na carteira" e bairro por card; Detalhe do Cliente mostra as três seções com os dados corretos; "Histórico de ações" navega para a aba Histórico. typecheck/lint/test (18/18) limpos.

<a id="d24"></a>
### 24. Tela de Check-in dedicada (relógio ao vivo + indicador de proximidade)

**Contexto**: o Check-in era só um botão dentro do Detalhe do Cliente que capturava uma leitura única de GPS no toque e só mostrava a distância *depois* de já ter confirmado. O wireframe real mostra Check-in como uma **tela própria**: relógio ao vivo, indicador de proximidade em tempo real ("você está a ~40m do cliente") **antes** de confirmar.
**Escolhido**: nova `CheckinScreen.tsx` (rota `Checkin: { clientId, visitId }` em `ClientesStackParamList`), aberta a partir do botão "Iniciar check-in" em `ClienteDetalheScreen` (que agora só navega, mesmo padrão já usado para `VisitaScreen` → `CheckoutScreen`, decisão nº 22). Novo hook `useLiveLocation` (`shared/hooks`) observa a posição continuamente via `Location.watchPositionAsync` (ao contrário de `useLocation`, que faz uma única leitura) — a distância até o cliente (`distanceKm`/`formatDistance`) atualiza sozinha enquanto a tela está aberta. O relógio usa um `setInterval` de 1s local à tela. "Confirmar check-in" usa a última coordenada observada.
**Sem gate de distância**: a documentação não especifica uma distância máxima obrigatória para liberar o check-in — o indicador é só informativo (cor do ícone muda de âmbar para verde abaixo de 200m, um limiar arbitrário só para dar destaque visual, não bloqueia nada). Se a regra de negócio real exigir um raio máximo, reconciliar aqui.
**Bug real encontrado e corrigido durante o teste end-to-end (Playwright)**: o `LocationSubscription` devolvido por `Location.watchPositionAsync` no **web** não implementa `remove()` corretamente — chamar no cleanup do efeito ao desmontar a tela (`removeSubscription is not a function`) derrubava a árvore React inteira (tela em branco ao voltar do Check-in, sem nenhum erro visível para o usuário). Mesma categoria de quirk de `expo-location`/`expo-sqlite`/`expo-secure-store` no web já documentada no item 18 — corrigido envolvendo a chamada em `try/catch` no cleanup de `useLiveLocation`.
**Confirmado**: testado via Playwright — abrir Check-in mostra relógio e distância ("~1.4 km do cliente") corretamente; confirmar check-in volta ao Detalhe do Cliente sem tela em branco, com "Check-in feito às HH:MM" e status "Em andamento". typecheck/lint/test (18/18) limpos.

<a id="d25"></a>
### 25. Histórico enriquecido (filtros de período, busca, sincronização por visita, rupturas, resultado da visita)

**Contexto**: o Histórico só mostrava cliente/horário/duração/atividades/fotos, sem nenhum filtro. A Documentação Funcional pede filtros de período (Hoje/7 dias/30 dias + calendário), busca por cliente, status de sincronização por visita ("Sincronizada"/"Na fila"), contagem de rupturas e o status "Cliente ausente" (que depende do campo `outcome`, já existente desde o Check-out — decisão nº 22).
**Escolhido**: `VisitHistoryEntry` (`models/VisitHistoryEntry.ts`) ganhou `clientId`, `outcome`, `rupturaCount` e `synced`. `HistoricoScreen` ganhou pills de período (Hoje/7 dias/30 dias/Todos, mesmo padrão visual dos filtros de `ClientesScreen`) e busca por nome de cliente; cada card mostra um Badge com o resultado da visita (`VISIT_OUTCOME_LABEL`) e outro com o status de sincronização.
**"+ calendário" — não implementado**: o wireframe também mostra um seletor de data customizado além dos presets de período. Não há nenhuma biblioteca de calendário no projeto ainda, e a escolha de qual (e o design do seletor) é uma decisão maior que merece confirmação em vez de suposição — implementados só os presets de período (Hoje/7 dias/30 dias/Todos), que cobrem o caso de uso mais comum. Ação futura: adicionar um seletor de intervalo de datas customizado se for confirmado como necessário.
**Contagem de rupturas — mesma aproximação do Check-out**: `rupturas` não guarda `visit_id` (decisão nº 22), então a contagem por visita usa `reported_at` dentro da janela `[checked_in_at, checked_out_at]` da visita, cruzado por `client_id`.
**Status de sincronização por visita**: calculado no hook (`useVisitHistory`), não no repositório — depende da fila de sincronização (`services/sync`), uma camada à parte dos dados de negócio (mesma separação de `useSyncStatus`). Novo `SyncQueue.pendingVisitIds()` extrai os `visitId` de qualquer escrita ainda pendente na fila (check-in/check-out/atividade/questionário — `register_ruptura` não carrega `visitId` no payload, mesma limitação já registrada no item 14, então uma ruptura enfileirada não derruba o selo "Sincronizada" da visita). Sem efeito em web (fila depende de `expo-sqlite`, sempre reporta tudo sincronizado — mesmo guard de `useSyncStatus`).
**Confirmado**: testado via Playwright — filtro "Hoje"/"30 dias"/"Todos" e busca por "Mundo" funcionam corretamente; card mostra "Visita concluída" e "Sincronizada" com os dados do seed fictício. typecheck/lint/test (18/18) limpos.

<a id="d26"></a>
### 26. Perfil enriquecido (cargo/cidade, Alterar senha, Notificações, Aparência, Ajuda e sobre)

**Contexto**: o Perfil já tinha avatar com iniciais (implementado antes deste comparativo), mas mostrava o fornecedor como badge em vez de cargo+cidade, e não tinha nenhum dos 4 itens de configuração do wireframe: Alterar senha, Notificações, Aparência (claro/escuro/automático) e Ajuda e sobre.
**Escolhido**: `Promoter` ganhou `role`/`city` (ex.: "Promotor técnico · Imperatriz", substituindo o badge de fornecedor). Perfil virou uma stack aninhada (`PerfilStackNavigator`, mesmo padrão de `ClientesStackNavigator`) com 4 sub-telas: `AlterarSenhaScreen`, `NotificacoesConfigScreen`, `AparenciaScreen`, `AjudaScreen`. Novo `usePreferencesStore` (Zustand + `persist` em `AsyncStorage`, sem criptografia — ao contrário da sessão de auth, decisão nº 3, não guarda nada sensível) guarda a preferência de aparência e os toggles de notificação.
**Alterar senha — reautenticação real**: o SDK do Supabase Auth não expõe uma checagem isolada de "senha atual" (`updateUser` troca a senha de qualquer sessão já autenticada, sem pedir a anterior). Em vez de pedir a senha atual só para UX e nunca validar (o que seria enganoso — o campo pareceria uma checagem de segurança que não existe), `AuthRepository.updatePassword` reautentica de verdade com `signInWithPassword(email, currentPassword)` antes de trocar; só segue para `updateUser` se a reautenticação confirmar que a senha atual está correta.
**"Notificações" aqui ≠ tela de Notificações**: este item de Perfil é a tela de **configuração** de quais avisos o promotor recebe (3 categorias: aprovação de endereço, lembretes de visita, atualizações do app) — diferente da tela de **Notificações** (a caixa de entrada/feed em si), que é o Grupo 7, ainda não atacado.
**Aparência — limitação documentada na época, resolvida no item 29**: quando esta tela foi construída, ela só selecionava e persistia `claro`/`escuro`/`automático`, sem recolorir o app de verdade. O suporte real a modo escuro foi implementado depois, ver item 29.
**Confirmado**: testado via Playwright — Perfil mostra "Promotor técnico · Imperatriz"; as 4 sub-telas abrem e voltam corretamente; toggle de notificação muda de estado; seleção de Aparência troca de "Claro" para "Escuro" corretamente; Alterar senha com dados válidos salva e volta ao Perfil sem erro. typecheck/lint/test (18/18) limpos.

<a id="d27"></a>
### 27. Notificações, banner de offline e recuperar senha — últimos gaps do comparativo

**Contexto**: fecha os 3 itens finais do comparativo contra a Documentação Funcional: a tela de **Notificações** (caixa de entrada, com os itens de exemplo "Endereço aprovado"/"Endereço recusado" sugerindo um fluxo de aprovação de atualização de endereço de cliente), o banner persistente **"Sem conexão · trabalhando offline"** na Home, e o link **"Recuperar senha"** no Login.
**Notificações — schema assumido**: não existe (ainda) uma tabela `notifications` nas migrations conhecidas — assumida com `kind`/`title`/`body`/`created_at`/`read_at` (ver aviso no topo de `types/supabase.types.ts`), a partir só dos 2 exemplos visíveis no wireframe. Reconciliar quando o schema real existir. O fluxo completo de "solicitar atualização de endereço → aprovação de back-office" (que gera esses 2 tipos de notificação) não existe em lugar nenhum do app — só a exibição da notificação em si foi implementada, não o fluxo de origem, que não estava no escopo de nenhuma tela já existente.
**Notificações — navegação**: nova stack aninhada na aba "Início" (`HomeStackNavigator`: Home → Notificações), já que a Home não tinha stack própria até agora. O sino já existia como placeholder sem ação (`HomeScreen`); ganhou `onPress` + um indicador (ponto vermelho) quando há notificação não lida.
**Banner de offline — bug real encontrado**: a primeira implementação usava só `NetInfo.addEventListener` (mesmo usado por `useAutoSync`) e nunca atualizava no web. Causa raiz: no Chromium, `navigator.connection` existe, e o adaptador web do `@react-native-community/netinfo` prioriza escutar o evento `change` desse objeto — que só dispara em troca de *tipo* de conexão (wifi↔celular), nunca em uma transição online/offline simples (confirmado isolando o teste: `connection.addEventListener('change', ...)` não disparou ao simular offline, mas `window.addEventListener('offline', ...)` disparou normalmente). Corrigido em `useNetworkStatus` fazendo o **web** ouvir `window`/`navigator.onLine` diretamente, ignorando `NetInfo` só nessa plataforma — o nativo continua usando `NetInfo` (que funciona corretamente via APIs do SO). Esse é um bug de biblioteca que afetaria qualquer app RN Web usando `netinfo` da mesma forma, não só este projeto.
**Bug real de infraestrutura encontrado e corrigido**: ao criar a nova pasta `src/screens/notificacoes/`, o Metro (com cache já aquecido de sessões anteriores) não resolvia os arquivos novos (`Unable to resolve "./useNotificacoesData"` mesmo o arquivo existindo) — exigiu reiniciar com `--clear`. Esse reinício revelou um segundo problema, pré-existente e mascarado pelo cache antigo: a implementação web de `expo-sqlite` (`expo-sqlite/web/worker.ts`) importa estaticamente um binário `.wasm`, e o Metro deste projeto não tinha `"wasm"` na lista de extensões de asset — como o Metro não faz code-splitting de verdade em `import()` dinâmico, ele resolve o grafo inteiro alcançável a partir de `database/local/db.ts` mesmo com o guard de `Platform.OS === 'web'` (que só impede o uso em runtime, não a resolução em build-time), e isso **quebrava o bundle web inteiro**, não só a Fila de sincronização. Corrigido com `config.resolver.assetExts.push('wasm')` em `metro.config.js`.
**Recuperar senha**: `AuthRepository.resetPasswordForEmail` chama `supabase.auth.resetPasswordForEmail`, sempre resolvendo com sucesso independente de o e-mail existir ou não (mensagem genérica "se esse e-mail estiver cadastrado..."), para não permitir enumeração de contas cadastradas.
**Confirmado**: testado via Playwright — "Esqueceu a senha?" → tela de recuperação → mensagem de confirmação → voltar ao login; sino da Home mostra ponto vermelho com notificação não lida, tela de Notificações agrupa por dia (Hoje/Ontem/data) com ícone por tipo, tocar numa notificação não lida marca como lida (ponto some, texto some do negrito); banner de offline aparece/some corretamente ao simular perda/retomada de conexão (`context.setOffline`). typecheck/lint/test (18/18) limpos.

<a id="d28"></a>
### 28. Check-in vai direto para Atividades, e a aba Clientes não fica mais travada num cliente

**Contexto**: usando o app de verdade (não só via Playwright), o usuário relatou 3 problemas de navegação encadeados: (1) depois de confirmar o check-in, o app voltava para o Detalhe do Cliente em vez de ir para o checklist de Atividades — exigia um toque extra em "Ir para Visita"; (2) por causa disso, o stack da aba "Clientes" ficava com `ClienteDetalhe`/`Checkin` empilhados por cima de `ClientesList` durante toda a visita; (3) consequência de (2): tocar na aba "Clientes" durante ou depois da visita mostrava o cliente/tela de check-in ainda ali, não a lista — "travado" num cliente.
**Escolhido**: `CheckinScreen.handleConfirm` agora, depois do check-in confirmado, chama `navigation.popToTop()` (reseta o próprio stack da aba Clientes de volta para `ClientesList`) e só então `navigation.getParent().navigate('Visita')` — vai direto para o checklist de Atividades, e a aba Clientes já fica limpa para quando o promotor tocar nela de novo. Isso exigiu trocar o tipo de `navigation` de `NavigationProp<ClientesStackParamList>` para `NativeStackNavigationProp<ClientesStackParamList>` (só neste arquivo) — `popToTop` é um método específico de stack navigator, não existe no tipo genérico `NavigationProp`.
**Um quarto relato não reproduzido**: o usuário também descreveu que, depois de ir para o Histórico e voltar, o app retornava para a Home em vez da tela de onde tinha saído. Não consegui reproduzir isso no preview web — tocar diretamente na aba de destino preserva o estado da aba anterior corretamente (testado via Playwright). A suspeita é que se trate do botão físico de voltar do Android (comportamento de `backBehavior` do `Tab.Navigator`, que não dá para simular no preview web) — adicionado `backBehavior="history"` explícito no `MainTabNavigator` como reforço defensivo (já era o default do React Navigation v6, mas agora está explícito). Se o problema persistir num aparelho real depois dessa mudança, precisa de reprodução passo a passo num dispositivo físico para investigar melhor.
**Confirmado**: testado via Playwright — check-in agora leva direto ao checklist de Atividades; aba Clientes mostra a lista completa (não o cliente anterior) tanto durante quanto depois da visita (check-in + checkout). typecheck/lint/test (18/18) limpos.

<a id="d29"></a>
### 29. Modo escuro de verdade (CSS variables + `colorScheme` do NativeWind)

**Contexto**: o usuário relatou que a opção de tema escuro (Perfil → Aparência) não fazia nada — só o tema claro funcionava. Isso era uma limitação conhecida e documentada (item 26 original): a tela salvava a preferência, mas nenhuma cor do app de fato mudava.
**Alternativa descartada**: adicionar uma variante `dark:` em toda className Tailwind de toda tela do app (~30 arquivos, cada `bg-surface-bg` viraria `bg-surface-bg dark:bg-[hex-escuro]`, e assim por diante) — mecânico, mas manual e fácil de esquecer um caso, sem nenhuma garantia de manter os dois temas em sincronia no futuro.
**Escolhido**: já que toda tela do app usa exclusivamente tokens semânticos do Design System (`bg-surface-bg`, `text-ink`, `border-line`, `bg-brand/10`...), nunca hex cru, deu para trocar o que esses tokens *significam* em vez de anotar cada uso:
1. `global.css` ganhou CSS variables (`--color-ink`, `--color-surface-bg`, etc.) com valores diferentes em `:root` (claro) e `.dark` (escuro) — os valores escuros reaproveitam a mesma paleta já usada no tema escuro do artefato de comparativo publicado nesta sessão, em vez de inventar cores novas.
2. `tailwind.config.js` ganhou `darkMode: 'class'` e cada cor passou a apontar para `rgb(var(--color-x) / <alpha-value>)` em vez de um hex fixo — a função `<alpha-value>` também mantém funcionando os modificadores de opacidade já usados (`bg-brand/10`, `bg-warning/10`...).
3. Resultado: **toda className Tailwind já existente em toda tela do app passou a respeitar o modo escuro automaticamente, sem editar nenhuma tela** — confirmado via Playwright indo de tela em tela depois de trocar para "Escuro": fundo, cards, texto e bordas mudaram sozinhos em Home, Clientes, Detalhe do Cliente, Histórico e Perfil.
4. A troca de tema em si usa a API `colorScheme` do NativeWind (`nativewind`, que reexporta de `react-native-css-interop`) — `colorScheme.set('light' | 'dark' | 'system')` adiciona/remove a classe `dark` no documento (web) ou avisa o runtime de estilos (nativo); funciona igual nas duas plataformas. Novo hook `useThemeSync` (`shared/hooks`), montado uma vez em `AppProviders`, chama `colorScheme.set()` toda vez que `usePreferencesStore().appearance` mudar — inclusive na primeira renderização, depois que o valor persistido termina de reidratar do `AsyncStorage`. "Automático" mapeia para `'system'` (segue o tema do aparelho); "Claro"/"Escuro" fixam manualmente.
**O que as CSS variables NÃO cobrem — ícones e estilos inline**: a prop `color` de ícones `Feather` (e qualquer estilo inline com hex) precisa de uma cor já resolvida, não de uma className — não dá pra usar CSS variables ali. Por isso `src/theme/colors.ts` ganhou `lightColors`/`darkColors` (dois objetos completos) e um hook `useThemeColors()` que devolve o objeto certo conforme o tema atual (via `useColorScheme()` do NativeWind, reativo). Todas as ~30 telas/componentes que importavam o antigo `colors` estático foram migrados para `const colors = useThemeColors();` dentro do próprio componente — troca mecânica (o nome da variável local continua `colors`, então nenhuma outra linha do arquivo muda). Em 2 arquivos (`RouteItemRow.tsx`, `NotificacoesScreen.tsx`) um `Record` de cores por status/tipo estava definido no escopo do módulo (fora de qualquer componente, onde não se pode chamar hook) — movido para dentro do componente que o usa.
**Confirmado**: testado via Playwright — trocar para "Escuro" recolore o app inteiro (fundos, cards, texto, bordas E ícones) em todas as telas visitadas; a preferência persiste depois de recarregar a página; voltar para "Claro" restaura o tema original corretamente; toda a suíte de regressão (fluxo completo de visita, ruptura, alterar senha) roda sem quebrar em modo claro (padrão). typecheck/lint/test (18/18) limpos.

<a id="d30"></a>
### 30. Positivação é contagem de clientes, não taxa

**Contexto**: o card "Positivação" da Home mostrava uma taxa (`68%`, campo `positivationRate: number` 0–1). O comparativo com o wireframe já tinha marcado isso como "a confirmar" (o print mostra "42 clientes"). O usuário confirmou: é contagem de clientes positivados no mês, não percentual.
**Escolhido**: `DashboardSummary.positivationRate` (0–1) virou `positivationCount` (inteiro) — model, `FakeDashboardRepository` (`48`), `DashboardRepository` (coluna `positivation_count` em vez de `positivation_rate`) e `HomeScreen` (`"48 clientes"` em vez de `formatPercentage(...)`) atualizados juntos. Assumido schema: a view `promoter_dashboard_summary` precisa expor `positivation_count` (inteiro) em vez de `positivation_rate` (float) — reconciliar ao criar/gerar o schema real (ver item 31).
**Confirmado**: testado via Playwright — card mostra "48 clientes". typecheck/lint/test (18/18) limpos.

<a id="d31"></a>
### 31. Schema real do Supabase criado do zero (`supabase/migrations/`)

**Contexto**: o app sempre rodou em modo mock (`useMockData`, item 17) porque nenhum projeto Supabase real estava conectado neste ambiente. O comentário no topo de `src/types/supabase.types.ts` apontava para migrations em `/mnt/user-data/outputs/lynkz_supabase/migrations/` — um caminho que nunca existiu neste repositório/ambiente. Ou seja: o schema "de referência" que o código vinha assumindo não existia em lugar nenhum de verificável; era hora de criar as migrations reais, versionadas no próprio repo.
**Ambiente disponível**: `npx supabase` (CLI v2.111.0) está instalado, mas Docker não está disponível (`docker: command not found`) — descarta `supabase start`/`supabase db lint` (que exigem um Postgres local via container). Sem login OAuth do usuário também não dá para `supabase link` a um projeto cloud a partir daqui. **Consequência**: as migrations abaixo foram escritas e revisadas manualmente (linha a linha, comparando contra cada `select`/`insert`/`update` real dos Repositories), mas **não foram executadas contra um Postgres de verdade neste ambiente** — falta validar com `supabase db push` (ou `supabase start` + `db reset`, se o usuário tiver Docker) antes de confiar 100% nelas em produção.
**Estrutura criada** — `supabase/migrations/`, uma tabela (ou grupo coeso) por arquivo, na ordem que as FKs exigem:
- `promoters`, `clients`, `visits`, `products` + `promoter_products`, `activities` + `questionnaires`, `rupturas`, `notifications`: colunas batendo exatamente com `src/types/supabase.types.ts` e com o que cada `*Repository.ts` real já `select`/`insert`/`update`. Soft delete (`deleted_at`) em `promoters`/`clients`, nunca `DELETE` físico (histórico de visitas referencia essas linhas). Índices desenhados a partir dos filtros reais dos Repositories (`(promoter_id, scheduled_date)`, `(promoter_id, status)` em `visits`; `is_active` em `products`; etc.), não genéricos.
- **`activities` ganhou `unique (visit_id, kind)`** — uma visita tem no máximo uma atividade "completa" por tipo. Isso só é seguro porque `VisitRepository.registerActivity` foi migrado de `.insert()` puro para `.upsert(..., { onConflict: 'visit_id,kind' })` nesta mesma sessão — sem essa troca, refazer uma atividade (ex.: tirar as fotos de novo) teria passado a falhar por violação de unicidade em vez de silenciosamente duplicar a linha (comportamento antigo, também indesejado). `questionnaires` ganhou `unique (visit_id)` pela mesma razão, mas `submitQuestionnaire` já fazia select-then-insert/update manualmente no client — a constraint só formaliza uma regra que o código já respeitava.
- **`promoter_monthly_metrics` (tabela nova, não estava em `supabase.types.ts`)**: não existe, em nenhuma tela implementada, nenhum fluxo de pedido/venda ou de "positivar um cliente" — então "Faturamento" e "Positivação" (item 30) não têm de onde vir dentro do próprio app. Assumido: uma tabela pequena `(promoter_id, month) -> (monthly_revenue, positivation_count)`, alimentada por um processo externo (import batch/ERP, via service role). **Reconciliar com a fonte real quando ela existir** — o nome/formato desta tabela é a parte mais especulativa de todo o schema.
- **View `promoter_dashboard_summary`**: recriada com `security_invoker = true` (já assumido em `supabase.types.ts`) juntando `promoters` + `promoter_monthly_metrics` (mês atual) + `visits` (agregados). `pending_count` não tem definição explícita em nenhum lugar da Documentação Funcional — assumido como "visitas de hoje ainda com status `scheduled`"; reconciliar se divergir do esperado.
- **RLS em toda tabela**, com uma função auxiliar `lynkz.current_promoter_id()` (resolve o promotor pelo `auth.uid()`, mesma lógica que `AuthRepository.fetchPromoterProfile` já fazia no client). `clients` e `rupturas` não têm `promoter_id` direto — escopo via `EXISTS (... join visits ...)`, coerente com a "carteira derivada de visits" (item 9). Achado durante a escrita: a view sendo `security_invoker` significa que o `LEFT JOIN` com `promoter_monthly_metrics` roda com a permissão do promotor logado — sem uma policy de `SELECT` nessa tabela (mesmo sem nenhum INSERT/UPDATE do app nela), o join nunca veria nenhuma linha e `monthly_revenue`/`positivation_count` sempre voltariam `0`, um bug silencioso e não um erro. Corrigido adicionando essa policy.
- **`supabase/seed.sql`**: espelha os mesmos dados fictícios de `repositories/fakes/fakeStore.ts` (1 promotor, 5 clientes, 4 visitas, 3 produtos, 4 notificações, os mesmos números de Faturamento/Positivação do mock) — para a primeira conexão a um projeto real já mostrar algo parecido com o modo mock. `promoters.auth_user_id` fica `NULL` no seed de propósito: criar o usuário de autenticação é um passo separado (Dashboard do Supabase ou `supabase auth admin`), não algo seguro de fazer via `INSERT` direto em `auth.users` (exige hash de senha gerenciado pelo GoTrue).
**Não resolvido nesta sessão** (fora de escopo do pedido "criar o banco de dados"): ainda falta (a) o usuário efetivamente criar/linkar um projeto Supabase (cloud, via `supabase login` + `supabase link`, ou local com Docker) e rodar `supabase db push` para aplicar estas migrations de verdade; (b) rodar `npm run gen:types` depois disso para substituir o `src/types/supabase.types.ts` manual pelo gerado; (c) `app.config.ts`'s `userInterfaceStyle` e `ScreenContainer`'s `StatusBar` (gaps nativos de modo escuro, já relatados ao usuário na conversa, sem pedido explícito de correção ainda).
**Confirmado**: revisão manual linha a linha de todas as 10 migrations + seed contra os Repositories reais; `npx supabase db lint` tentado e falhou com `ECONNREFUSED` (esperado, sem Docker) — validação real contra Postgres fica pendente para quando houver um projeto/Docker disponível. typecheck/lint/test (ver rodada abaixo).

<a id="d32"></a>
### 32. Check-in via atalho da Home: `popToTop()` pulava para o cliente errado, não para a lista

**Contexto**: o item 28 (`popToTop()` + troca de aba) tinha sido "confirmado via Playwright", mas o teste usado entrava no fluxo pela aba Clientes (lista → cliente → check-in). O usuário testou no celular de verdade entrando pelo caminho mais comum — o botão "Iniciar check-in" da própria Home — e viu a aba Clientes ficar novamente travada num cliente depois do check-in, exatamente o bug que o item 28 dizia ter corrigido.
**Causa raiz real (não é race condition de transição nativa, hipótese inicial descartada depois de reproduzir no preview web)**: o botão "Iniciar check-in" da Home salta direto de Home para `ClienteDetalhe` via `navigation.getParent().navigate('Clientes', {screen: 'ClienteDetalhe', params})` — isso inicializa o stack da aba Clientes com histórico `[ClienteDetalhe, Checkin]`, **sem nunca empilhar `ClientesList`**. `popToTop()` sempre volta para o índice 0 do histórico *atual*, que nesse caminho é `ClienteDetalhe`, não `ClientesList`. Reproduzido e confirmado via `navigation.getState()` logado no preview web: depois do `popToTop()`, o estado ficava `{index: 0, routes: [{name: "ClienteDetalhe", ...}]}` — nunca havia um `ClientesList` para voltar. Quando o check-in começa pela aba Clientes (lista → cliente → check-in), `ClientesList` está no histórico e `popToTop()` funciona por coincidência — por isso o teste antigo nunca pegou o bug.
**Escolhido**: troquei `popToTop()` por `navigation.reset({ index: 0, routes: [{ name: 'ClientesList' }] })` — destino explícito, correto independente de qual caminho trouxe o usuário até o check-in. O reset roda num listener de `blur` da tela (não direto em `handleConfirm`), e só quando um `didConfirmRef` (setado em `handleConfirm` só depois do check-in ser bem-sucedido) está true — sem esse guard, voltar da tela de Check-in sem confirmar (botão "voltar") também dispararia o reset e descartaria indevidamente o Detalhe do Cliente para onde o usuário estava voltando.
**Alternativa descartada**: inverter a ordem das duas chamadas originais (trocar de aba antes de resetar o stack) parecia corrigir o problema reportado, mas ao testar via Playwright revelou um bug diferente: a aba Clientes passava a ficar travada de novo (o `popToTop()`, chamado num stack já em segundo plano, deixava de ter efeito). O problema nunca foi a ordem — sempre foi `popToTop()` presumir que `ClientesList` estaria no histórico.
**Confirmado**: 3 cenários testados via Playwright no preview web — (1) check-in pelo atalho da Home → vai direto para Atividades e a aba Clientes volta a mostrar a lista completa depois; (2) fluxo completo entrando pela aba Clientes (lista → cliente → check-in → atividades → fotos → questionário → check-out) → passa ponta a ponta, aba Clientes mostra a lista depois do check-out; (3) abrir Check-in e apertar "voltar" sem confirmar → volta corretamente para o Detalhe do Cliente, sem resetar o stack. typecheck/lint/test (18/18) limpos.
**Ainda não confirmado num Android real**: esta correção não foi testada de volta no celular do usuário (só no preview web) — o relato original que motivou a investigação veio de lá; pendente de confirmação.
