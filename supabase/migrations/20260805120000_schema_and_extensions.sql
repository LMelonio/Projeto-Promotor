-- Schema dedicado do app (nunca usar "public" — mantém o catálogo do
-- Supabase isolado de outros projetos que possam compartilhar o mesmo
-- banco/organização) e a extensão usada para gerar UUIDs em default de coluna.
create schema if not exists lynkz;

create extension if not exists pgcrypto with schema extensions;

comment on schema lynkz is
  'Schema de dados do app Lynkz Promotor. Ver docs/DECISIONS.md, item 31.';
