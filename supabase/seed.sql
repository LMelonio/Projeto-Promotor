-- Dados de exemplo para desenvolvimento — espelha o modo mock
-- (src/repositories/fakes/fakeStore.ts) para que o app se comporte de forma
-- parecida ao rodar contra um Supabase real pela primeira vez.
--
-- auth_user_id do promotor fica NULL de propósito: criar o usuário de auth
-- é um passo separado (Supabase Dashboard > Authentication > Add user, ou
-- `supabase auth admin` da CLI) porque exige senha/hash gerenciados pelo
-- GoTrue — não algo seguro de fazer via INSERT direto em auth.users. Depois
-- de criar o usuário com o e-mail abaixo, vincule com:
--   update lynkz.promoters set auth_user_id = '<uuid do usuário criado>'
--   where email = 'joao.avert@lynkzdistribuidora.com.br';

insert into lynkz.promoters (id, auth_user_id, full_name, email, phone, supplier, role, city, status)
values (
  '11111111-1111-1111-1111-111111111111',
  null,
  'João Pereira',
  'joao.avert@lynkzdistribuidora.com.br',
  '(99) 98111-2201',
  'AVERT',
  'Promotor técnico',
  'Imperatriz',
  'active'
);

insert into lynkz.clients
  (id, erp_code, cnpj, legal_name, trade_name, email, phone, address, neighborhood, city, state, credit_limit, rating, latitude, longitude, financial_status)
values
  ('22222222-2222-2222-2222-222222222201', 'ERP20001', '12.345.678/0001-90', 'PET AMIGO COMERCIO DE PRODUTOS VETERINARIOS LTDA', 'Pet Amigo', 'contato@petamigo.com.br', '(99) 3524-1180', 'Av. Getúlio Vargas, 1204', 'Centro', 'Imperatriz', 'MA', 15000, 4, -4.95395, -47.518666, 'compliant'),
  ('22222222-2222-2222-2222-222222222202', 'ERP20002', '23.456.789/0001-01', 'CASA DO PET EIRELI', 'Casa do Pet', 'financeiro@casadopet.com.br', '(99) 3532-4477', 'Rua das Acácias, 88', 'Nova Conquista', 'Açailândia', 'MA', 8000, 3, -5.350312, -47.474662, 'delinquent'),
  ('22222222-2222-2222-2222-222222222203', 'ERP20003', '34.567.890/0001-12', 'VET CENTER LTDA ME', 'Vet Center', 'compras@vetcenter.com.br', '(63) 3411-7722', 'Av. Bernardo Sayão, 350', 'Setor Central', 'Araguaína', 'TO', 22000, 5, -6.553675, -47.40998, 'compliant'),
  ('22222222-2222-2222-2222-222222222204', 'ERP20004', '45.678.901/0001-23', 'MUNDO ANIMAL LTDA', 'Mundo Animal', 'mundoanimal@gmail.com', '(99) 3551-2290', 'Rua dos Ipês, 512', 'Bom Jesus', 'Grajaú', 'MA', 5000, null, -7.54673, -46.050988, 'compliant'),
  ('22222222-2222-2222-2222-222222222205', 'ERP20005', '56.789.012/0001-34', 'PET VIDA COMERCIO DE PRODUTOS VETERINARIOS LTDA', 'Pet Vida', 'atendimento@petvida.com.br', '(94) 3324-5567', 'Av. Antônio Maia, 977', 'Nova Marabá', 'Marabá', 'PA', 12000, 4, -5.81464, -46.142943, 'compliant');

insert into lynkz.products (id, internal_code, ean_code, supplier, name, category, is_active)
values
  ('33333333-3333-3333-3333-333333333301', 'AVT0001', '7890001001006', 'AVERT', 'ARTROTABS VET X 30 COMP', 'Condroprotetor', true),
  ('33333333-3333-3333-3333-333333333302', 'AVT0008', '7890008001009', 'AVERT', 'CANINUS PROTEIN BAR DISP X 16', 'Petisco', true),
  ('33333333-3333-3333-3333-333333333303', 'AVT0009', '7890009001008', 'AVERT', 'CISTIMICIN VET 20 COMP X 30', 'Medicamento', true);

insert into lynkz.promoter_products (promoter_id, product_id, status)
select '11111111-1111-1111-1111-111111111111', id, 'available' from lynkz.products;

insert into lynkz.visits
  (id, promoter_id, client_id, scheduled_date, scheduled_time, status, checked_in_at, checked_out_at, reason, outcome)
values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222201', current_date, '09:00:00', 'scheduled', null, null, null, null),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222202', current_date, '10:30:00', 'scheduled', null, null, null, null),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222203', current_date, '14:00:00', 'scheduled', null, null, null, null),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222204', current_date - 1, '11:00:00', 'completed', (current_date - 1) + time '11:05:00', (current_date - 1) + time '11:47:00', 'routine', 'completed');

insert into lynkz.notifications (id, promoter_id, kind, title, body, created_at, read_at)
values
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'visit_reminder', 'Lembrete de visita', 'Você tem uma visita agendada para Casa do Pet às 10:30 hoje.', current_date + time '07:00:00', null),
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'address_approved', 'Endereço aprovado', 'A atualização de endereço de Pet Amigo foi aprovada pelo back-office.', current_date + time '08:15:00', null),
  ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', 'address_rejected', 'Endereço recusado', 'A atualização de endereço de Vet Center foi recusada. Verifique os dados e tente novamente.', (current_date - 1) + time '09:00:00', (current_date - 1) + time '09:05:00'),
  ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', 'generic', 'Atualização do app', 'Nova versão do Lynkz Promotor disponível com melhorias de desempenho.', (current_date - 3) + time '10:00:00', (current_date - 3) + time '10:10:00');

-- Faturamento/positivação (ver docs/DECISIONS.md, item 31) — mesmos valores
-- fixos usados hoje em FakeDashboardRepository, para o KPI da Home bater
-- visualmente com o modo mock na primeira conexão real.
insert into lynkz.promoter_monthly_metrics (promoter_id, month, monthly_revenue, positivation_count)
values (
  '11111111-1111-1111-1111-111111111111',
  date_trunc('month', current_date)::date,
  128450,
  48
);
