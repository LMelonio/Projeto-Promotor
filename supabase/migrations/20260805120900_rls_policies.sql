-- Row Level Security — cada promotor só vê/edita o que é seu.
--
-- current_promoter_id(): resolve o id em lynkz.promoters a partir do usuário
-- autenticado (auth.uid()). Mesma consulta que AuthRepository.fetchPromoterProfile
-- já faz no client por auth_user_id — aqui vira a base de toda policy abaixo.
create or replace function lynkz.current_promoter_id()
returns uuid
language sql
stable
security invoker
set search_path = lynkz, pg_temp
as $$
  select id from lynkz.promoters where auth_user_id = auth.uid()
$$;

-- ── promoters ────────────────────────────────────────────────────────────
-- Um promotor só enxerga e atualiza o próprio cadastro (ex.: tela de Perfil).
-- Nenhum INSERT/DELETE pelo app — cadastro é responsabilidade do back-office
-- (service role, que ignora RLS).
create policy promoters_select_own on lynkz.promoters
  for select using (auth_user_id = auth.uid());

create policy promoters_update_own on lynkz.promoters
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ── clients ──────────────────────────────────────────────────────────────
-- Carteira derivada de visits (ver docs/DECISIONS.md): um promotor só vê um
-- cliente se existir ao menos uma visita dele para esse cliente. Somente
-- leitura — cadastro de cliente é responsabilidade do back-office.
create policy clients_select_via_visits on lynkz.clients
  for select using (
    exists (
      select 1 from lynkz.visits v
      where v.client_id = clients.id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

-- ── visits ───────────────────────────────────────────────────────────────
-- Agendadas pelo back-office (sem INSERT do app). O app só faz UPDATE de
-- check-in/check-out (ClientRepository.checkIn/checkOut) — v1 não restringe
-- quais colunas podem mudar (isso exigiria trigger/coluna-a-coluna), fica
-- como limitação conhecida a endurecer depois se necessário.
create policy visits_select_own on lynkz.visits
  for select using (promoter_id = lynkz.current_promoter_id());

create policy visits_update_own on lynkz.visits
  for update using (promoter_id = lynkz.current_promoter_id())
  with check (promoter_id = lynkz.current_promoter_id());

-- ── products / promoter_products ────────────────────────────────────────
-- Catálogo é dado de referência, comum a todos os promotores autenticados.
-- Somente leitura — gerenciado pelo back-office.
create policy products_select_all on lynkz.products
  for select to authenticated using (true);

create policy promoter_products_select_own on lynkz.promoter_products
  for select using (promoter_id = lynkz.current_promoter_id());

-- ── activities ───────────────────────────────────────────────────────────
-- VisitRepository.registerActivity usa upsert (onConflict visit_id,kind) —
-- precisa de policy de INSERT e de UPDATE, não só SELECT.
create policy activities_select_own on lynkz.activities
  for select using (promoter_id = lynkz.current_promoter_id());

create policy activities_insert_own on lynkz.activities
  for insert with check (promoter_id = lynkz.current_promoter_id());

create policy activities_update_own on lynkz.activities
  for update using (promoter_id = lynkz.current_promoter_id())
  with check (promoter_id = lynkz.current_promoter_id());

-- ── questionnaires ───────────────────────────────────────────────────────
-- Não tem promoter_id direto — escopo via visit_id -> visits.promoter_id.
-- submitQuestionnaire faz select-then-insert/update, então precisa das três.
create policy questionnaires_select_own on lynkz.questionnaires
  for select using (
    exists (
      select 1 from lynkz.visits v
      where v.id = questionnaires.visit_id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

create policy questionnaires_insert_own on lynkz.questionnaires
  for insert with check (
    exists (
      select 1 from lynkz.visits v
      where v.id = questionnaires.visit_id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

create policy questionnaires_update_own on lynkz.questionnaires
  for update using (
    exists (
      select 1 from lynkz.visits v
      where v.id = questionnaires.visit_id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

-- ── rupturas ─────────────────────────────────────────────────────────────
-- Não tem promoter_id direto — escopo via client_id -> visits.promoter_id
-- (mesma lógica de "carteira derivada de visits" usada em clients). Só
-- SELECT/INSERT: o app não tem fluxo de editar/resolver ruptura já registrada.
create policy rupturas_select_via_visits on lynkz.rupturas
  for select using (
    exists (
      select 1 from lynkz.visits v
      where v.client_id = rupturas.client_id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

create policy rupturas_insert_via_visits on lynkz.rupturas
  for insert with check (
    exists (
      select 1 from lynkz.visits v
      where v.client_id = rupturas.client_id
        and v.promoter_id = lynkz.current_promoter_id()
    )
  );

-- ── notifications ───────────────────────────────────────────────────────
-- Criadas pelo back-office (service role). O app só lê e marca como lida.
create policy notifications_select_own on lynkz.notifications
  for select using (promoter_id = lynkz.current_promoter_id());

create policy notifications_update_own on lynkz.notifications
  for update using (promoter_id = lynkz.current_promoter_id())
  with check (promoter_id = lynkz.current_promoter_id());

-- ── promoter_monthly_metrics ─────────────────────────────────────────────
-- Alimentada por processo externo (service role) — sem INSERT/UPDATE pelo
-- app. Precisa de policy de SELECT mesmo assim: a view
-- promoter_dashboard_summary é security_invoker, então o LEFT JOIN com esta
-- tabela roda com a permissão do próprio promotor logado — sem esta policy,
-- o join nunca enxergaria nenhuma linha e monthly_revenue/positivation_count
-- sempre voltariam 0 (silenciosamente errado, não um erro visível).
create policy promoter_monthly_metrics_select_own on lynkz.promoter_monthly_metrics
  for select using (promoter_id = lynkz.current_promoter_id());
