# Lynkz Promotor — App Mobile

Aplicativo de campo para promotores técnicos da Lynkz Distribuidora (Avert, Boehringer, Organnact). Cobre o fluxo completo de visita: login, dashboard, carteira de clientes, check-in/check-out dedicados e georreferenciados, atividades (questionário, fotos, ruptura), histórico e perfil.

Este repositório é o código-fonte real do app, não mais um protótipo. As decisões de UX/UI, banco de dados e Design System aprovadas nas etapas anteriores do projeto serviram de fonte da verdade para esta implementação — nenhuma tela ou token de cor foi inventado agora.

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | Expo (React Native + TypeScript) | Único codebase para iOS/Android, câmera/GPS/notificações via módulos oficiais Expo, build gerenciado via EAS |
| Backend | Supabase (Postgres + PostGIS + Storage + Auth + RLS) | Planejado; nenhum projeto real conectado ainda — o app roda em modo mock por padrão (ver `docs/DECISIONS.md`, item 17) |
| Estado remoto | TanStack Query | Cache, retry automático e invalidação — essencial com a rede instável de campo |
| Estado local | Zustand | Sessão de auth; leve, sem boilerplate de Redux |
| Estilo | NativeWind (Tailwind) | Tokens do Design System aplicados via `tailwind.config.js` |
| Navegação | React Navigation | Stack (Auth) + Bottom Tabs (Main, 5 itens) |
| Formulários | react-hook-form + zod | Validação tipada, mesma lib já usada em outras partes do ecossistema JS do projeto |

Justificativa completa em [`docs/DECISIONS.md`](./docs/DECISIONS.md).

## Estado atual (4 fases concluídas + reconciliação com a Documentação Funcional)

✅ Implementado e testado:
- Configuração completa do projeto (TS, lint, Tailwind, Jest, Expo config com permissões)
- Design System tipado (`src/theme`) espelhando os tokens aprovados
- Camada de dados: cliente Supabase seguro, `AuthRepository`, `DashboardRepository`, `ClientRepository`, `VisitRepository`, `HistoryRepository`
- Navegação completa (Auth ↔ Main, 5 abas, botão central elevado "Visita"), incluindo stacks aninhadas das abas Clientes e Visita
- Tela de **Login** (biometria + e-mail/senha)
- Tela de **Home/Dashboard** (saudação, próxima visita, KPIs, roteiro do dia)
- Tela de **Clientes/Roteiro** (busca por nome/código ERP/CNPJ + filtros: Roteiro do dia, Adimplentes, Inadimplentes; contador "N na carteira")
- Tela de **Detalhe do Cliente** (Informações, Endereço com "Ver no Google Maps", Financeiro com limite de crédito, link para Histórico — ver `docs/DECISIONS.md` item 23)
- Tela de **Check-in** dedicada (relógio ao vivo + indicador de proximidade em tempo real via `useLiveLocation` — ver `docs/DECISIONS.md` item 24)
- **Visita em andamento**: checklist de **Atividades** (Questionário de PDV, Fotos da gôndola, Verificação de preços, Registro de ruptura — reescrito a partir da Documentação Funcional real, ver `docs/DECISIONS.md` item 21), **Questionário de PDV** como assistente de 8 perguntas de múltipla escolha, **Fotos** com galeria de miniaturas reais, **Ruptura** com leitura de EAN + gravidade + foto obrigatória
- Tela de **Check-out** dedicada (resumo da visita + motivo + resultado, georreferenciado — ver `docs/DECISIONS.md` item 22)
- Tela de **Histórico** de visitas finalizadas (filtros de período Hoje/7 dias/30 dias, busca por cliente, resultado da visita, status de sincronização e contagem de rupturas por visita — ver `docs/DECISIONS.md` item 25)
- Tela de **Perfil completo** (cargo/cidade, status da fila de sincronização, Alterar senha, Notificações, Aparência, Ajuda e sobre, logout — ver `docs/DECISIONS.md` item 26)
- **Modo escuro de verdade** (claro/escuro/automático, aplicado no app inteiro via CSS variables + `colorScheme` do NativeWind — ver `docs/DECISIONS.md` item 29)
- Tela de **Notificações** (caixa de entrada agrupada por dia, lidas/não lidas, sino com indicador na Home — ver `docs/DECISIONS.md` item 27)
- **Banner de offline** persistente na Home ("Sem conexão · trabalhando offline") e link **"Recuperar senha"** no Login (ver `docs/DECISIONS.md` item 27)
- **Fila de sincronização offline** (SQLite + `services/sync`): check-in/check-out/Atividade/Questionário/Ruptura nunca se perdem por falta de sinal — ficam na fila e reenviam sozinhos quando a conexão volta (ou manualmente, pelo Perfil)
- Suíte de testes unitários passando, zero erros de TypeScript, zero warnings de ESLint

⏭️ Não implementado ainda (todas as 4 fases planejadas foram concluídas — ver limitações conhecidas abaixo e `docs/DECISIONS.md`):
- Upload real dos binários das fotos de Atividade para o Supabase Storage (hoje só a contagem é sincronizada — ver `docs/DECISIONS.md`, itens 13 e 14)
- A lista "Rupturas deste cliente" só reflete um registro feito offline depois que a fila sincronizar de verdade (ver `docs/DECISIONS.md`, item 14)
- Fluxo de solicitação/aprovação de atualização de endereço de cliente: só a notificação de resultado ("Endereço aprovado"/"recusado") existe; o fluxo que a origina (editar endereço, fila de aprovação do back-office) não foi implementado — ver `docs/DECISIONS.md`, item 27
- Filtro de período por calendário customizado no Histórico: hoje só os presets Hoje/7 dias/30 dias/Todos — ver `docs/DECISIONS.md`, item 25

## Como rodar

```bash
npm install
npm start               # abre o Metro Bundler / Expo Go
```

**Ainda não tem um projeto Supabase?** Sem problema — sem o arquivo `.env`, o app sobe automaticamente em **modo mock** (dados fictícios em memória, ver `docs/DECISIONS.md` item 17): login aceita qualquer e-mail/senha e todas as telas mostram dados de exemplo. Assim que tiver um projeto Supabase real, rode `cp .env.example .env` e preencha as credenciais — o app volta a usar dados reais automaticamente, nenhum código muda.

Também é possível abrir um preview no navegador com `npm run web` (útil para ver rapidamente telas/navegação — câmera e GPS funcionam via APIs do próprio navegador; só biometria exige Expo Go/dispositivo real).

Scripts úteis:

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm test             # jest
npm run web          # preview no navegador
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
