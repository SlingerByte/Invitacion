-- 002_guest_name.sql — nombre que acompaña la predicción
-- Ejecutar una vez, después de 001_init.sql:
--   psql "$DATABASE_URL" -f db/migrations/002_guest_name.sql
-- o pegando el contenido en el SQL Editor del panel de Neon.

begin;

-- El nombre lo escribe el propio invitado. No es autenticación ni identifica
-- la asistencia: sólo acompaña su predicción y nunca se devuelve en los
-- resultados agregados.
alter table votes add column if not exists guest_name text;

-- Las filas anteriores a esta migración no tienen nombre; por eso la columna es
-- nullable. La API exige el nombre en todos los votos nuevos.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'votes_guest_name_length'
  ) then
    alter table votes
      add constraint votes_guest_name_length
      check (
        guest_name is null
        or char_length(btrim(guest_name)) between 2 and 40
      );
  end if;
end
$$;

comment on column votes.guest_name is
  'Nombre escrito por el invitado para acompañar su predicción. No se publica.';

commit;
