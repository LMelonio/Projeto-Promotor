-- Promotores (ver src/types/supabase.types.ts e AuthRepository.fetchPromoterProfile).
--
-- auth_user_id é anulável de propósito (ver docs/DECISIONS.md): um promotor
-- pode ser cadastrado pelo back-office antes de existir a conta de login
-- correspondente em auth.users. Soft delete via deleted_at, nunca DELETE físico
-- — histórico de visitas/atividades referencia promoter_id e não deve sumir.
create table lynkz.promoters (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  supplier text not null,
  role text not null,
  city text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Único por auth_user_id, mas só entre os não-nulos (vários promotores podem
-- estar com auth_user_id nulo simultaneamente, aguardando vínculo de login).
create unique index promoters_auth_user_id_key
  on lynkz.promoters (auth_user_id)
  where auth_user_id is not null;

create index promoters_status_idx on lynkz.promoters (status) where deleted_at is null;

alter table lynkz.promoters enable row level security;
