# Arquitetura — Lynkz Promotor

## Princípio geral

Separação em camadas com dependência em uma única direção:

```
Telas (screens)
   ↓ usam
Hooks de dados (useHomeData, futuros useClientesData, useVisitaData...)
   ↓ usam
React Query  ·  Zustand (stores)
   ↓ usam
Repositories (interfaces + implementations)
   ↓ usam
Supabase client  ·  Database local (SQLite, fase de sincronização offline)
```

Nenhuma tela importa `@/services/supabase/client` diretamente. Nenhuma tela sabe que o backend é Supabase — se soubéssemos, uma migração futura de backend exigiria reescrever a UI inteira. Regra dura: **toda leitura/escrita de dado remoto passa por um Repository.**

## Por que essa separação (e não "chamar Supabase direto na tela")

1. **Testabilidade**: dá para testar uma tela com um `FakeAuthRepository` sem precisar de rede nem de mockar o SDK do Supabase inteiro.
2. **Offline-first futuro**: a Fase 4 (sincronização) vai inserir uma camada de fila local entre o Repository e o Supabase — se as telas já chamassem o Supabase direto, essa mudança quebraria todo o app. Chamando por Repository, só a implementação interna muda.
3. **Alinhamento de nomenclatura**: os `models/` (ex.: `Promoter`, `DashboardSummary`) usam nomes de campo estáveis em camelCase, independentes de como as colunas do Postgres estão nomeadas. Se uma coluna for renomeada no banco, só o mapper dentro do Repository muda.

## Estrutura de pastas

```
src/
├── app/providers/     Composição de providers globais (React Query, SafeArea, GestureHandler)
├── navigation/         Stacks e tabs + tipos de rota
├── screens/            Uma pasta por tela/fluxo; componentes específicos da tela ficam em screens/<tela>/components
├── components/
│   ├── ui/             Átomos reutilizáveis em qualquer tela (Button, Card, Badge, KpiCard)
│   ├── layout/          Wrappers estruturais (ScreenContainer)
│   └── feedback/        Estados de loading/erro/vazio
├── shared/
│   ├── hooks/           Hooks reaproveitáveis não amarrados a uma tela (useBiometricAuth)
│   └── utils/           Funções puras (date.ts) — fáceis de testar isoladamente
├── services/
│   ├── supabase/        Cliente único + adaptador de storage seguro
│   ├── api/              Serviços auxiliares que não são "repositório de entidade" (ex.: lastKnownUser)
│   └── sync/             Fila de sincronização offline (Fase 4) — SyncQueue, syncEngine, useSyncStatus
├── database/local/       SQLite local (Fase 4) — só a fila de sincronização, nenhum outro dado de negócio
├── repositories/
│   ├── interfaces/       Contratos (IAuthRepository, IDashboardRepository, ...)
│   └── implementations/  Implementações concretas sobre Supabase
├── models/               Tipos de domínio usados pela UI (independentes do schema do banco)
├── types/                Tipos gerados/manuais do Supabase + declarações de módulo (aes-js.d.ts)
├── theme/                Design System tipado (colors, typography, spacing)
├── stores/               Zustand — apenas estado de sessão local (NÃO dado remoto)
├── validators/           Schemas zod de formulário
└── constants/             (reservado para constantes globais futuras)
```

## Gerenciamento de estado — por que Zustand + React Query, e não só um dos dois

- **React Query** é dono de todo **dado que vem do servidor**: dashboard, clientes, produtos, histórico. Ele decide quando refazer a busca, cacheia por `queryKey`, tenta de novo automaticamente em falha de rede — que é o cenário normal de uso em campo.
- **Zustand** é dono de **estado de sessão local**: quem está logado, status de autenticação. Não duplicamos isso no React Query porque sessão não é "dado remoto cacheável" no mesmo sentido — é estado de aplicação.
- Rejeitamos **Redux** por trazer boilerplate (actions/reducers/slices) sem ganho real para o tamanho deste app.
- Rejeitamos **Context API pura** para dado de servidor porque não tem cache/retry embutido — reinventaríamos o React Query com mais código.

## Navegação

- `RootNavigator`: único ponto de decisão Auth vs Main, baseado em `useAuthStore().status`.
- `AuthNavigator`: stack simples (hoje só Login).
- `MainTabNavigator`: bottom tabs fixas com 5 itens (decisão de produto travada — não é dado dinâmico). O item central "Visita" usa `tabBarButton` customizado (`ElevatedTabButton`) para o efeito de botão elevado do Design System.

Ao adicionar uma tela de fluxo profundo (ex.: Detalhe do Cliente dentro da aba Clientes), o padrão recomendado é criar uma stack aninhada dentro da tab — já aplicado na Fase 2 via `ClientesStackNavigator` (`ClientesList` → `ClienteDetalhe`) e na Fase 3 via `VisitaStackNavigator` (`VisitaAtiva` → `Questionario` / `Ruptura`).

## Fases planejadas (não implementar tudo de uma vez)

| Fase | Escopo | Status |
|---|---|---|
| 1 | Setup, Design System, Auth, Home | ✅ Concluída |
| 2 | Clientes/Roteiro + Detalhe do Cliente + início do Check-in | ✅ Concluída |
| 3 | Atividades/Questionário + Fotos obrigatórias + Ruptura | ✅ Concluída |
| 4 | Check-out + Histórico + Perfil completo + fila de sincronização offline (SQLite + `services/sync`) | ✅ Concluída |

Cada fase deve seguir o ciclo já acordado: analisar → planejar → validar → implementar → revisar → testar → documentar → prosseguir. Não implementar dezenas de telas de uma vez.

## Fila de sincronização offline (Fase 4)

`database/local/db.ts` abre um SQLite local (`expo-sqlite`) só com a tabela `sync_queue` — nenhum outro dado de negócio é cacheado ali, isso é papel do React Query. `services/sync/syncEngine.ts` centraliza, em `SYNC_HANDLERS`, o "como executar" cada tipo de ação enfileirável (check-in, check-out, Atividade, Questionário, Ruptura) e expõe duas funções:

- `runOrQueue(kind, payload)`: tentativa imediata; se falhar, enfileira o mesmo payload. Usada pelos hooks de mutação (`useCheckIn`, `useCheckOut`, `useRegisterActivity`, `useSubmitQuestionnaire`, `useRegisterRuptura`).
- `flushQueue()`: reenvia toda a fila pendente, em ordem — chamada automaticamente por `useAutoSync` (montado em `AppProviders`) sempre que a conectividade volta, e manualmente pelo botão "Sincronizar agora" no Perfil (`useSyncStatus`).

Ver `docs/DECISIONS.md`, item 14, para o raciocínio completo (por que uma fila genérica por "tipo", a disciplina de timestamp de captura vs. sincronização, e a simplificação aceita na lista de Rupturas).
