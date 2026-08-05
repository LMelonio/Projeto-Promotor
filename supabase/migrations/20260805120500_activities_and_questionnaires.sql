-- Atividades e Questionário de uma visita (ver docs/DECISIONS.md, item 21 —
-- reescritas a partir da Documentação Funcional real).
--
-- unique (visit_id, kind): uma visita tem no máximo uma atividade "completa"
-- por tipo — refazer uma atividade (ex.: tirar as fotos de novo) substitui o
-- registro em vez de duplicar. VisitRepository.registerActivity já foi
-- ajustado para usar upsert com onConflict 'visit_id,kind' em vez de insert
-- puro, exatamente por causa desta constraint (ver docs/DECISIONS.md, item 31).
create table lynkz.activities (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references lynkz.visits (id) on delete cascade,
  client_id uuid not null references lynkz.clients (id) on delete restrict,
  promoter_id uuid not null references lynkz.promoters (id) on delete restrict,
  kind text not null check (kind in ('questionnaire', 'photos', 'price_check', 'ruptura')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  photo_count integer not null default 0 check (photo_count >= 0),
  created_at timestamptz not null default now(),

  constraint activities_visit_kind_key unique (visit_id, kind)
);

create index activities_visit_idx on lynkz.activities (visit_id);

-- Um questionário por visita (VisitRepository.submitQuestionnaire já faz
-- select-then-insert/update no client, esta constraint só formaliza a mesma regra).
create table lynkz.questionnaires (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references lynkz.visits (id) on delete cascade,
  -- Índice (0-3) da alternativa escolhida, por id de pergunta — ver models/Questionnaire.ts.
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint questionnaires_visit_id_key unique (visit_id)
);

alter table lynkz.activities enable row level security;
alter table lynkz.questionnaires enable row level security;
