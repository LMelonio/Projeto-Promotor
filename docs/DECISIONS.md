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

---

## Decisões Técnicas — Fase 2

### 9. "Carteira de clientes" derivada de `visits`, sem tabela de atribuição própria

**Escolhido**: `ClientRepository.listPortfolio` busca todo cliente com pelo menos uma visita (passada ou futura) registrada para o promotor autenticado, na tabela `visits` — mesmo padrão já usado em `DashboardRepository.getTodayRoute`.
**Alternativa considerada**: uma tabela explícita `promoter_clients` (atribuição fixa de carteira).
**Motivo**: nenhuma migration conhecida até agora expõe essa tabela — inventar seu nome/formato repetiria o erro que a decisão nº 7 já evita para `supabase.types.ts`. Como `visits` já carrega o vínculo promotor↔cliente (usado desde a Fase 1 na Home), reaproveitá-lo é a opção que não exige adivinhar schema novo.
**Ação futura**: se as migrations reais tiverem uma tabela de atribuição fixa (carteira independente de visita já ter ocorrido), revisar `listPortfolio` para consultá-la diretamente — hoje um cliente sem nenhuma visita agendada nunca aparece na lista.

### 10. Colunas `checked_in_latitude`/`checked_in_longitude` em `visits` — assumidas, não confirmadas

**Contexto**: o check-in georreferenciado (Fase 2) precisa persistir a coordenada capturada no momento do toque, e a tabela `visits` só tinha, no tipo manual herdado da Fase 1, `checked_in_at`.
**Escolhido**: adicionar `checked_in_latitude`/`checked_in_longitude` (nullable) ao tipo manual de `visits` em `src/types/supabase.types.ts`, marcadas com comentário de "assumido, reconciliar ao gerar tipos reais" — mesmo espírito da decisão nº 7.
**Ação futura**: ao rodar `npm run gen:types`, confirmar se as migrations reais usam esses nomes (ou, por exemplo, um único campo `geography`/PostGIS) e ajustar `ClientRepository.checkIn` de acordo.

### 11. Check-in sem visita agendada para hoje: bloqueado, não criado ad-hoc

**Escolhido**: a tela de Detalhe do Cliente só oferece "Iniciar check-in" quando já existe uma visita com `status = 'scheduled'` para o cliente na data de hoje. Sem visita, mostra apenas "Nenhuma visita agendada para hoje com este cliente." — não cria uma visita nova on-the-fly.
**Motivo**: criar uma visita ad-hoc é uma decisão de produto (mudaria o roteiro planejado, afetaria KPIs de aderência ao roteiro) que não foi pedida para esta fase — o escopo aprovado é "início do Check-in" sobre visitas já existentes. Melhor deixar explícito e bloqueado do que inventar um comportamento novo sem validação.
**Ação futura**: se o produto decidir permitir visita não planejada, tratar como uma feature nova (com sua própria tela/confirmação), não como uma alteração silenciosa deste fluxo.

---

## Decisões Técnicas — Fase 3

### 12. Schema de Atividades/Questionário/Ruptura baseado em `Base App Promotor.xlsx`, não adivinhado

**Contexto**: ao contrário das Fases 1 e 2 (onde não havia nenhuma fonte confiável para os nomes de tabela/coluna, ver decisão nº 7), foi localizada ao lado do projeto (`Desktop/Projeto Promotor/Base App Promotor.xlsx`, fora deste repositório Git) uma planilha funcional com abas `Produtos`, `CarteiraProdutos`, `Atividades`, `Questionarios` e `Rupturas` — dados de exemplo com as colunas exatas do domínio que esta fase precisa modelar.
**Escolhido**: usar essa planilha como fonte de verdade para **quais campos existem e seu significado de negócio** (ex.: `Atividades` tem `Tipo_Atividade`, `Status`, `Quantidade_Fotos`, `Observacoes`; `Rupturas` não tem `Visita_ID` nem `Promotor_ID` — é uma falta de produto associada só a Cliente+Produto). Os nomes de coluna em `src/types/supabase.types.ts`, porém, continuam traduzidos para o padrão inglês/snake_case já usado nas tabelas de Fases anteriores (`activities`, `questionnaires`, `rupturas`, `products`, `promoter_products`), e os enums (`ActivityType`, `RupturaStatus`) usam chaves em inglês com label em português na UI — mesmo padrão de `FinancialStatus`/`VisitStatus`, para manter o código internamente consistente em vez de misturar convenções.
**Catálogo fixo assumido**: os seis tipos de atividade (`Instalação de materiais`, `Treinamento`, `Organização de gôndola`, `Precificação`, `Ação promocional`, `Reposição`) e os dois status de ruptura (`Pendente`/`Resolvida`) vêm direto dos valores distintos observados na planilha. Já `ActivityStatus` inclui `pending`, que não aparece nos dados de exemplo (toda atividade amostrada já está `Concluída`) — assumido por simetria com o fluxo de check-in.
**Ação futura**: mesmo aviso da decisão nº 7 — reconciliar contra migrations reais ao rodar `npm run gen:types`. Além disso, essa planilha revelou uma tabela `CarteiraClientes` (Promotor_ID/Cliente_ID/Status) que parece ser exatamente a "tabela de atribuição fixa de carteira" que a decisão nº 9 (Fase 2) já previa como possível — vale revisitar `ClientRepository.listPortfolio` num ciclo futuro à luz disso.

### 13. Fotos de Atividade ficam só no dispositivo nesta fase — upload real entra com a fila de sincronização (Fase 4)

**Escolhido**: `ActivityCameraModal` captura as fotos ao vivo (decisão nº 8) e a tela registra apenas a **contagem** (`photo_count`) junto da atividade — os binários não são enviados ao Supabase Storage nesta fase.
**Alternativa considerada**: fazer upload direto para um bucket do Storage a cada foto capturada.
**Motivo**: `docs/ARCHITECTURE.md` já reserva explicitamente "fila de sincronização offline (SQLite + services/sync)" para a Fase 4, exatamente por causa da rede instável em campo — implementar upload síncrono de imagem agora duplicaria esse esforço e criaria um caminho de falha (visita sem internet) que a Fase 4 é quem deve resolver de verdade. Também exigiria assumir o nome de um bucket de Storage sem confirmação, repetindo o risco da decisão nº 7.
**Ação futura**: ao implementar a fila de sincronização da Fase 4, incluir o envio dos binários de foto (hoje descartados após a contagem) como parte do mesmo mecanismo.

---

## Decisões Técnicas — Fase 4

### 14. Fila de sincronização offline: retry genérico por "tipo de ação", não por entidade

**Escolhido**: uma única tabela SQLite `sync_queue` (`database/local/db.ts`) guarda `{id, kind, payload, created_at, attempts, last_error}`; `services/sync/syncEngine.ts` mantém um mapa `SYNC_HANDLERS: Record<SyncKind, (payload) => Promise<...>>` com um handler por tipo de escrita (`check_in`, `check_out`, `register_activity`, `submit_questionnaire`, `register_ruptura`). `runOrQueue(kind, payload)` tenta a chamada real primeiro; se falhar por qualquer motivo, enfileira o mesmo payload — não distingue "sem internet" de outros erros de rede, porque em campo esse é o cenário dominante e as validações client-side (coordenadas obtidas, foto ≥ 1, quantidade > 0) já reduzem bastante a chance de um payload inválido chegar até aqui.
**Alternativa considerada**: uma fila/tabela específica por entidade (ex.: `pending_checkins`, `pending_activities`).
**Motivo da escolha**: um único mecanismo de retry (mesma tabela, mesmo loop de `flushQueue`) é mais simples de raciocinar e testar do que N filas paralelas, e novos tipos de ação offline só precisam de uma entrada nova em `SYNC_HANDLERS` — não de uma tabela nova.
**Timestamp de captura, não de sincronização**: `checkIn`/`checkOut` passaram a receber `occurredAt` explícito do chamador (em vez de gerar `new Date()` dentro do Repository) — se a ação ficar enfileirada por horas até haver sinal, o horário gravado no servidor precisa refletir o momento real do check-in/check-out, não o momento em que o app finalmente conseguiu enviar. `registerRuptura` recebeu o mesmo tratamento (`reportedAt` em `NewRupturaInput`).
**Simplificação aceita conscientemente**: quando uma ação é enfileirada offline, o cache do React Query é corrigido otimisticamente só onde a tela já dependia diretamente daquele estado (checklist de Atividades, badge do Questionário, status da visita em `today-visit`/`active-visit`) — a lista "Rupturas deste cliente" **não** recebe patch otimista, só aparece após sincronizar de verdade (`useRegisterRuptura` em `useVisitaData.ts`). Fazer isso também exigiria inventar um id local e um status "pendente de sincronização" só para essa lista, para um caso de uso secundário (revisão de rupturas já registradas) — não parece valer o custo agora.
**Ação futura**: os binários das fotos de Atividade (decisão nº 13) **continuam não sincronizados** nesta fase — a fila lida com dados estruturados (JSON), não com arquivos. Adicionar isso exigiria decidir um bucket/caminho de Storage (ainda não confirmado, mesmo risco da decisão nº 7) e uma estratégia de payload maior (base64 em SQLite tem custo de espaço/performance real) — fica registrado como próximo passo, não escondido.

### 15. "Finalizar visita" (check-out) mora na aba Visita, não no Detalhe do Cliente

**Escolhido**: o botão de check-out fica no topo de `VisitaScreen` (o "hub" da visita em andamento desde a Fase 3), não em `ClienteDetalheScreen` — que ganhou só um atalho "Ir para Visita" enquanto a visita está em andamento, e um resumo (horário + duração) quando já concluída.
**Alternativa considerada**: manter check-in E check-out simétricos, os dois em `ClienteDetalheScreen` (onde o check-in já vive desde a Fase 2).
**Motivo**: depois que o check-in acontece, o fluxo do promotor migra para a aba Visita (Atividades/Questionário/Ruptura) — pedir para ele voltar para Clientes só para encerrar a visita que está acompanhando na outra aba criaria uma navegação de ida e volta desnecessária. Check-in continua em Detalhe do Cliente porque é o ponto de partida natural (decisão de produto da Fase 2, não revisada aqui).

### 16. Histórico agrega contagem de Atividades/Fotos por consulta separada, não por coluna denormalizada

**Escolhido**: `HistoryRepository.listCompletedVisits` busca `visits` (status `completed`) e depois `activities` filtradas por `visit_id in (...)`, agregando contagem e soma de `photo_count` em memória — não existe (nem foi assumida) uma coluna `quantidade_atividades`/`quantidade_fotos` na tabela `visits`, mesmo a planilha de referência (decisão nº 12) tendo essas colunas em `HistoricoVisitas`.
**Motivo**: essas colunas, na planilha, parecem ser um resumo pré-calculado (típico de export de BI) — mantê-las como dado derivado (agregado a partir de `activities`, que já existe e é a fonte real) evita um segundo lugar para desincronizar caso uma atividade seja adicionada/editada depois do check-out.

---

## Decisões — testar o app de verdade pela primeira vez

Até aqui, "validação" significava `typecheck`/`lint`/`test`. Nenhum deles exercita o Metro bundler nem um dispositivo/navegador real — então vários problemas reais só apareceram quando o app foi de fato executado (Expo Go e depois preview web). Registrados aqui porque nenhum é óbvio a partir do código sozinho.

### 17. Modo mock de dados fictícios (`useMockData` + `repositories/fakes/`)

**Contexto**: o app nunca teve um projeto Supabase real conectado (nenhuma fase anterior teve acesso a isso, e a pasta `lynkz_supabase/migrations/` citada desde a Fase 1 não existe em nenhum lugar acessível). Sem isso, o app não consegue nem inicializar — e criar um projeto Supabase real ficou para uma etapa futura.
**Escolhido**: se **nenhuma** das duas envs do Supabase estiver definida, `src/config/env.ts` ativa `useMockData = true`, e cada `implementations/*Repository.ts` exporta uma implementação fictícia de `repositories/fakes/` em vez da real — nenhuma tela precisa saber disso, ambas satisfazem a mesma interface (`IAuthRepository`, `IClientRepository` etc., exatamente o benefício que `docs/ARCHITECTURE.md` já previa para essa camada desde a Fase 1). Os dados fictícios (`fakeStore.ts`) reaproveitam nomes/coordenadas da planilha de referência (decisão nº 12) para parecerem realistas, e mutações (check-in, atividade, ruptura...) alteram um estado em memória compartilhado, então o app reage de verdade a interações dentro da mesma sessão.
**Alternativa considerada**: preencher `.env` com valores fictícios só para passar da checagem de `requireEnv`. Rejeitada — o app chegaria a abrir a tela de Login, mas login/dashboard/tudo mais continuaria quebrado (erro de rede contra uma URL falsa), não permitindo testar o fluxo de verdade.
**Se só UMA** das duas envs estiver definida (config real pela metade), `useMockData` continua `false` e o erro original de `requireEnv` continua disparando — isso é config quebrada de verdade, não modo mock intencional.
**Ação futura**: ao conectar um Supabase real, basta preencher `.env` — nenhum código muda, o switch é automático.

### 18. Correções que só apareceram ao rodar o app de verdade (Expo Go + preview web)

Lista curta, cada uma descoberta ao efetivamente iniciar o Metro bundler e abrir o app num cliente real — nenhuma aparecia em `typecheck`/`lint`/`test`:

- **`expo-asset`/`expo-font` ausentes do `node_modules`** e 4 pacotes desalinhados com o SDK 52 — instalação incompleta desde a Fase 1, só travava o `expo start`. Corrigido com `npx expo install --fix`.
- **`assets/icon.png`/`splash.png`/`adaptive-icon.png` nunca existiam** (só `logo.png`) — `app.config.ts` referenciava arquivos inexistentes; só quebra ao um dispositivo real buscar o manifesto (fallback exige login numa conta EAS). Gerados a partir do logo existente.
- **`extra.eas.projectId` com placeholder literal** (`"PREENCHER_APOS_CRIAR_PROJETO_EAS"`) fazia o Expo tentar validar esse ID contra os servidores da EAS ao conectar um cliente real, também caindo no mesmo fluxo de login. Removido — só deve voltar com um projectId real, ao rodar `eas init`.
- **`@opentelemetry/api` ausente**: `@supabase/supabase-js` tenta importar isso dinamicamente (telemetria opcional, `.catch(() => null)` em runtime); o bundler Metro (diferente de webpack/vite) resolve `import()` estaticamente e quebra o bundle **web** sem essa dependência instalada. Instalada como dependência direta, mesmo nunca sendo usada.
- **Módulos nativos que chamam `requireNativeModule(...)` no escopo do módulo** (não dentro de uma função) — `expo-sqlite`, `expo-secure-store`, `expo-crypto`, `expo-camera`, `expo-location`, `expo-local-authentication` fazem isso. Um `import` estático de qualquer um deles quebra o carregamento do bundle inteiro em **web** (plataforma sem os bindings nativos), mesmo que nenhuma função do módulo seja chamada. Corrigido de forma pontual onde já bloqueava o app inteiro: `database/local/db.ts` (fila de sincronização) usa import dinâmico + guard `Platform.OS==='web'` nos chamadores (`useAutoSync`, `useSyncStatus`); `lastKnownUser.ts` (SecureStore) ganhou try/catch, já que é só uma saudação cosmética. **Não** foi feito o mesmo para `expo-camera`/`expo-location`/`expo-local-authentication` — funcionam perfeitamente em dispositivo real (Expo Go), e aplicar esse mesmo tratamento a todos seria um retrofit bem maior para uma plataforma (web) que nunca foi o alvo do projeto (ver stack em `README.md`). Se o preview web precisar tocar câmera/GPS/biometria no futuro, aplicar o mesmo padrão.
- **`metro.config.js` nunca existia**: NativeWind v4 precisa dele (`withNativeWind`) para gerar/injetar o CSS do Tailwind especificamente no bundle **web** — sem isso, o app renderizava (visualmente sem estilo nenhum, HTML "cru"). Adicionado; sem efeito no nativo, que já resolve as classes via `nativewind/babel` (`babel.config.js`).

**Conclusão prática**: `typecheck`/`lint`/`test` continuam necessários mas não são suficientes para saber se o app "roda" — vale rodar `npx expo start` (ou o preview web) pelo menos uma vez por fase daqui pra frente.
