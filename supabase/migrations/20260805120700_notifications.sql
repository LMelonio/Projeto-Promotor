-- Notificações (ver docs/DECISIONS.md, item 27 — assumida a partir dos itens
-- de exemplo do wireframe: "Endereço aprovado"/"Endereço recusado"). Criadas
-- pelo back-office/processos internos (service role) — o app só lê e marca
-- como lida (NotificationRepository não tem create/insert).
create table lynkz.notifications (
  id uuid primary key default gen_random_uuid(),
  promoter_id uuid not null references lynkz.promoters (id) on delete cascade,
  kind text not null
    check (kind in ('address_approved', 'address_rejected', 'visit_reminder', 'generic')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_promoter_idx on lynkz.notifications (promoter_id, created_at desc);

alter table lynkz.notifications enable row level security;
