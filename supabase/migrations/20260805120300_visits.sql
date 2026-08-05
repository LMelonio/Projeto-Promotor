-- Visitas — agendadas pelo back-office (o app nunca faz INSERT aqui, só
-- UPDATE de check-in/check-out, ver ClientRepository.checkIn/checkOut).
--
-- checked_in_latitude/longitude e checked_out_latitude/longitude ficam nulos
-- até o respectivo check-in/check-out acontecer (assumido na Fase 2/4, ver
-- src/types/supabase.types.ts). reason/outcome só são preenchidos no
-- check-out (ver docs/DECISIONS.md, item 22).
create table lynkz.visits (
  id uuid primary key default gen_random_uuid(),
  promoter_id uuid not null references lynkz.promoters (id) on delete restrict,
  client_id uuid not null references lynkz.clients (id) on delete restrict,
  scheduled_date date not null,
  scheduled_time time,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  checked_in_at timestamptz,
  checked_in_latitude double precision,
  checked_in_longitude double precision,
  checked_out_at timestamptz,
  checked_out_latitude double precision,
  checked_out_longitude double precision,
  reason text check (reason in ('sale', 'training', 'routine', 'audit')),
  outcome text check (outcome in ('completed', 'client_absent', 'closed')),
  created_at timestamptz not null default now(),

  -- Um check-out só faz sentido depois de um check-in.
  constraint visits_checkout_after_checkin check (
    checked_out_at is null or checked_in_at is not null
  )
);

-- HomeScreen.useDashboardSummary/useTodayRoute e ClientRepository.getVisitOfTheDay
-- filtram por (promoter_id, scheduled_date) e (promoter_id, status) o tempo todo.
create index visits_promoter_date_idx on lynkz.visits (promoter_id, scheduled_date);
create index visits_promoter_status_idx on lynkz.visits (promoter_id, status);
create index visits_client_idx on lynkz.visits (client_id);

-- getActiveVisit ordena por checked_in_at desc filtrando status = 'in_progress'.
create index visits_promoter_checked_in_idx
  on lynkz.visits (promoter_id, checked_in_at desc)
  where status = 'in_progress';

alter table lynkz.visits enable row level security;
