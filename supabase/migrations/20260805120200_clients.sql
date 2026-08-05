-- Clientes (ver docs/DECISIONS.md, item 23 — campos do wireframe
-- "4-Detalhes do Cliente"). Não tem promoter_id direto: a carteira de um
-- promotor é derivada de quais visitas existem para ele (ver
-- docs/DECISIONS.md — "Carteira de Clientes derivada de visits"), não de uma
-- atribuição fixa aqui.
create table lynkz.clients (
  id uuid primary key default gen_random_uuid(),
  erp_code text not null,
  cnpj text not null,
  legal_name text not null,
  trade_name text not null,
  email text,
  phone text,
  address text not null,
  neighborhood text not null,
  city text not null,
  state text not null,
  credit_limit numeric(14, 2) not null default 0,
  rating numeric(2, 1),
  latitude double precision not null,
  longitude double precision not null,
  financial_status text not null default 'compliant'
    check (financial_status in ('compliant', 'delinquent')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index clients_erp_code_key on lynkz.clients (erp_code);
create unique index clients_cnpj_key on lynkz.clients (cnpj);

alter table lynkz.clients enable row level security;
