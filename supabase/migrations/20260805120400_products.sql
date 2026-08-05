-- Catálogo de produtos (referência, gerenciado pelo back-office) e a
-- atribuição de disponibilidade por promotor (VisitRepository.listAssignedProducts).
create table lynkz.products (
  id uuid primary key default gen_random_uuid(),
  internal_code text not null,
  ean_code text not null,
  supplier text not null,
  name text not null,
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index products_internal_code_key on lynkz.products (internal_code);
create index products_active_idx on lynkz.products (is_active);

create table lynkz.promoter_products (
  promoter_id uuid not null references lynkz.promoters (id) on delete cascade,
  product_id uuid not null references lynkz.products (id) on delete cascade,
  status text not null default 'available' check (status in ('available', 'unavailable')),
  primary key (promoter_id, product_id)
);

alter table lynkz.products enable row level security;
alter table lynkz.promoter_products enable row level security;
