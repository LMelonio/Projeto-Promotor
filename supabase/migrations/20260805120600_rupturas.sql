-- Rupturas (falta de produto em um cliente) — registradas durante uma visita
-- mas ligadas ao cliente, não à visita (VisitRepository.listClientRupturas
-- lista o histórico completo do cliente, não só o da visita atual).
create table lynkz.rupturas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references lynkz.clients (id) on delete cascade,
  product_id uuid not null references lynkz.products (id) on delete restrict,
  supplier text not null,
  severity text not null check (severity in ('stockout', 'low_stock')),
  quantity_missing integer not null check (quantity_missing > 0),
  photo_count integer not null default 0 check (photo_count >= 0),
  reported_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

create index rupturas_client_idx on lynkz.rupturas (client_id, reported_at desc);

alter table lynkz.rupturas enable row level security;
