-- 001_init.sql — esquema base de la votación
-- Ejecutar una sola vez sobre la base de datos de Neon:
--   psql "$DATABASE_URL" -f db/migrations/001_init.sql
-- o pegando el contenido en el SQL Editor del panel de Neon.

begin;

-- Estado de la votación. Una sola fila (id = 1), editable únicamente desde
-- el servidor (scripts/poll.ts o el SQL Editor). Nunca desde el navegador.
create table if not exists poll_settings (
  id         smallint    primary key default 1,
  is_open    boolean     not null default true,
  updated_at timestamptz not null default now(),
  constraint poll_settings_singleton check (id = 1)
);

-- Un registro por navegador. La identidad del navegador se guarda como
-- HMAC-SHA256(pepper, identificador aleatorio de la cookie). El nombre que
-- escribe el invitado se añade en 002_guest_name.sql.
create table if not exists votes (
  id         uuid        primary key default gen_random_uuid(),
  voter_hash text        not null,
  prediction text        not null,
  created_at timestamptz not null default now(),
  constraint votes_prediction_allowed check (prediction in ('girl', 'boy')),
  constraint votes_voter_hash_format check (voter_hash ~ '^[0-9a-f]{64}$')
);

-- Unicidad real: es la garantía que impide dos votos del mismo navegador,
-- incluso si llegan dos solicitudes simultáneas. La API usa
-- INSERT ... ON CONFLICT DO NOTHING y responde con el voto existente.
create unique index if not exists votes_voter_hash_key on votes (voter_hash);
create index if not exists votes_prediction_idx on votes (prediction);
create index if not exists votes_created_at_idx on votes (created_at desc);

-- Mantener updated_at al día cuando se abra o cierre la votación.
create or replace function set_poll_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists poll_settings_touch on poll_settings;
create trigger poll_settings_touch
  before update on poll_settings
  for each row execute function set_poll_settings_updated_at();

insert into poll_settings (id, is_open)
values (1, true)
on conflict (id) do nothing;

commit;

-- Los resultados se consultan siempre agregados:
--   select count(*) filter (where prediction = 'girl') as girl,
--          count(*) filter (where prediction = 'boy')  as boy,
--          count(*)                                    as total,
--          max(created_at)                             as updated_at
--   from votes;
