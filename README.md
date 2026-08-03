# Lynkz Promotor — App Mobile

Aplicativo de campo para promotores técnicos da Lynkz Distribuidora (Avert, Boehringer, Organnact). Cobre o fluxo completo de visita: login, dashboard, carteira de clientes, check-in/check-out georreferenciado, atividades com fotos obrigatórias e registro de rupturas.

Este repositório é o código-fonte real do app — não é mais protótipo/wireframe. As decisões de UX/UI, banco de dados e Design System já aprovadas nas etapas anteriores do projeto foram usadas como fonte da verdade para esta implementação (nenhuma tela ou token de cor foi inventado agora).

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | Expo (React Native + TypeScript) | Único codebase para iOS/Android, câmera/GPS/notificações via módulos oficiais Expo, build gerenciado via EAS |
| Backend | Supabase (Postgres + PostGIS + Storage + Auth + RLS) | Já existe e está pronto (`lynkz_supabase/migrations/`) |
| Estado remoto | TanStack Query | Cache, retry automático e invalidação — essencial com a rede instável de campo |
| Estado local | Zustand | Sessão de auth; leve, sem boilerplate de Redux |
| Estilo | NativeWind (Tailwind) | Tokens do Design System aplicados via `tailwind.config.js` |
| Navegação | React Navigation | Stack (Auth) + Bottom Tabs (Main, 5 itens) |
| Formulários | react-hook-form + zod | Validação tipada, mesma lib já usada em outras partes do ecossistema JS do projeto |

Justificativa completa em [`docs/DECISIONS.md`](./docs/DECISIONS.md).

## Estado atual (Fase 4 de N)

✅ Implementado e testado:
- Configuração completa do projeto (TS, lint, Tailwind, Jest, Expo config com permissões)
- Design System tipado (`src/theme`) espelhando os tokens aprovados
- Camada de dados: cliente Supabase seguro, `AuthRepository`, `DashboardRepository`, `ClientRepository`, `VisitRepository`, `HistoryRepository`
- Navegação completa (Auth ↔ Main, 5 abas, botão central elevado "Visita"), incluindo stacks aninhadas das abas Clientes e Visita
- Tela de **Login** (biometria + e-mail/senha)
- Tela de **Home/Dashboard** (saudação, próxima visita, KPIs, roteiro do dia)
- Tela de **Clientes/Roteiro** (busca por nome/código ERP + filtros: Roteiro do dia, Adimplentes, Inadimplentes)
- Tela de **Detalhe do Cliente** + **Check-in georreferenciado** (captura de GPS ao vivo via `useLocation`, nunca posição em cache)
- **Visita em andamento**: checklist de **Atividades** (6 tipos fixos, foto obrigatória capturada ao vivo via `expo-camera`), **Questionário** da visita (4 perguntas objetivas + observações), **registro de Ruptura** (falta de produto, restrita à carteira de produtos do promotor) e **Check-out georreferenciado** ("Finalizar visita")
- Tela de **Histórico** de visitas finalizadas (cliente, horário, duração, atividades/fotos)
- Tela de **Perfil completo** (dados do promotor + status da fila de sincronização + logout)
- **Fila de sincronização offline** (SQLite + `services/sync`): check-in/check-out/Atividade/Questionário/Ruptura nunca se perdem por falta de sinal — ficam na fila e reenviam sozinhos quando a conexão volta (ou manualmente, pelo Perfil)
- Suíte de testes unitários passando, zero erros de TypeScript, zero warnings de ESLint

⏭️ Não implementado ainda (todas as 4 fases planejadas foram concluídas — ver limitações conhecidas abaixo e `docs/DECISIONS.md`):
- Upload real dos binários das fotos de Atividade para o Supabase Storage (hoje só a contagem é sincronizada — ver `docs/DECISIONS.md`, itens 13 e 14)
- A lista "Rupturas deste cliente" só reflete um registro feito offline depois que a fila sincronizar de verdade (ver `docs/DECISIONS.md`, item 14)

## Como rodar

```bash
npm install
cp .env.example .env   # preencher com as credenciais do projeto Supabase
npm start               # abre o Metro Bundler / Expo Go
```

Scripts úteis:

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm test             # jest
npm run gen:types    # regenera src/types/supabase.types.ts a partir do Supabase real
```

## ⚠️ Antes de ir para produção

`src/types/supabase.types.ts` é um **placeholder manual** (documentado no topo do próprio arquivo). Assim que o projeto Supabase (com as migrations de `lynkz_supabase/migrations/`) estiver acessível, rode:

```bash
export SUPABASE_PROJECT_ID=xxxx
npm run gen:types
```

e reconcilie os nomes de campo em `src/repositories/implementations/*.ts` com o tipo gerado — os nomes atuais foram inferidos a partir da documentação funcional e podem não bater 100% com as colunas reais das migrations.

## Estrutura de pastas

Ver `docs/ARCHITECTURE.md` para a explicação de cada camada (`repositories`, `models`, `stores`, `services`, etc.) e o racional de arquitetura em camadas.
