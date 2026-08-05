-- Faturamento (monthly_revenue) e contagem de positivação (positivation_count)
-- não têm nenhuma tabela de origem no app hoje (não existe fluxo de
-- pedido/venda nem de "positivar um cliente" em nenhuma tela implementada).
-- São dados que vêm de fora (ERP/BI do fornecedor). Assumido para a Fase 5
-- (ver docs/DECISIONS.md, item 31): uma tabela pequena, populada por um
-- processo externo (import batch/service role), com um valor por
-- promotor+mês. Reconciliar com a fonte real quando ela existir.
create table lynkz.promoter_monthly_metrics (
  promoter_id uuid not null references lynkz.promoters (id) on delete cascade,
  -- Sempre o primeiro dia do mês (ex.: 2026-08-01) — chave natural simples.
  month date not null,
  monthly_revenue numeric(14, 2) not null default 0,
  positivation_count integer not null default 0,
  updated_at timestamptz not null default now(),

  primary key (promoter_id, month)
);

alter table lynkz.promoter_monthly_metrics enable row level security;

-- View agregada por trás do resumo da Home (DashboardRepository.getSummary).
-- security_invoker faz a view respeitar a RLS de quem está consultando (o
-- promotor autenticado), em vez de vazar dados de outros promotores.
--
-- pending_count: não há definição explícita na Documentação Funcional para
-- "Pendências" — assumido como "visitas de hoje ainda não iniciadas"
-- (status = 'scheduled' e scheduled_date = hoje). Reconciliar se a definição
-- real divergir.
create view lynkz.promoter_dashboard_summary
with (security_invoker = true) as
select
  p.id as promoter_id,
  coalesce(m.monthly_revenue, 0) as monthly_revenue,
  coalesce(m.positivation_count, 0) as positivation_count,
  count(v.id) filter (
    where v.scheduled_date = current_date and v.status = 'completed'
  ) as visits_today_done,
  count(v.id) filter (where v.scheduled_date = current_date) as visits_today_total,
  count(v.id) filter (
    where v.scheduled_date = current_date and v.status = 'scheduled'
  ) as pending_count,
  coalesce(
    avg(
      extract(epoch from (v.checked_out_at - v.checked_in_at)) / 60
    ) filter (
      where v.status = 'completed'
        and v.checked_in_at is not null
        and v.checked_out_at is not null
    ),
    0
  )::integer as average_visit_minutes
from lynkz.promoters p
left join lynkz.promoter_monthly_metrics m
  on m.promoter_id = p.id
  and m.month = date_trunc('month', current_date)::date
left join lynkz.visits v
  on v.promoter_id = p.id
where p.deleted_at is null
group by p.id, m.monthly_revenue, m.positivation_count;
