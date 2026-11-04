/**
 * Procedimiento administrativo de la votación.
 * Uso (desde tu equipo, con DATABASE_URL en .env o en el entorno):
 *   npm run poll:status
 *   npm run poll:results
 *   npm run poll:close
 *   npm run poll:open
 *
 * Nunca se expone como botón público: no hay ruta HTTP que abra o cierre la
 * votación, sólo esta herramienta con acceso directo a la base de datos.
 */
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL. Copia .env.example a .env y pega la cadena de Neon.');
  process.exit(1);
}

const sql = neon(url);
const command = process.argv[2] ?? 'status';

async function showStatus(): Promise<void> {
  const rows = (await sql.query(
    `select is_open, updated_at from poll_settings where id = 1`,
  )) as { is_open: boolean; updated_at: string }[];
  const row = rows[0];
  if (!row) {
    console.error('No existe la fila de configuración. Ejecuta db/migrations/001_init.sql.');
    process.exit(1);
  }
  console.log(`Votación: ${row.is_open ? 'ABIERTA' : 'CERRADA'} (actualizado ${row.updated_at})`);
}

async function showResults(): Promise<void> {
  const rows = (await sql.query(
    `select
       count(*) filter (where prediction = 'girl')::int as girl,
       count(*) filter (where prediction = 'boy')::int  as boy,
       count(*)::int                                    as total
     from votes`,
  )) as { girl: number; boy: number; total: number }[];
  const row = rows[0] ?? { girl: 0, boy: 0, total: 0 };
  const pct = (n: number): string =>
    row.total === 0 ? '0 %' : `${((n / row.total) * 100).toFixed(1)} %`;
  console.log(`Niña: ${row.girl} (${pct(row.girl)})`);
  console.log(`Niño: ${row.boy} (${pct(row.boy)})`);
  console.log(`Total: ${row.total}`);
}

async function setOpen(isOpen: boolean): Promise<void> {
  await sql.query(`update poll_settings set is_open = $1::boolean where id = 1`, [isOpen]);
  console.log(`Votación ${isOpen ? 'ABIERTA' : 'CERRADA'}.`);
}

async function main(): Promise<void> {
  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'results':
      await showResults();
      break;
    case 'close':
      await setOpen(false);
      break;
    case 'open':
      await setOpen(true);
      break;
    default:
      console.error(`Comando desconocido: ${command}. Usa status | results | close | open.`);
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error('Error al hablar con la base de datos:', error);
  process.exit(1);
});
