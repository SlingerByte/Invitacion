/**
 * Aplica las migraciones de `db/migrations/` contra Neon.
 *
 * Uso:
 *   npm run db:migrate
 *
 * El driver HTTP de Neon no mantiene una sesión entre consultas, así que cada
 * sentencia se ejecuta por separado y se omiten `begin`/`commit`. Las
 * migraciones son idempotentes (`if not exists`, `create or replace`, `on
 * conflict do nothing`), por lo que repetir el comando es seguro.
 */
import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL. Revisa `.env` antes de migrar.');
  process.exit(1);
}

const FILES = ['001_init.sql', '002_guest_name.sql'];

/**
 * Divide un archivo SQL en sentencias, respetando cadenas, comentarios y
 * bloques `$$ ... $$` (funciones y DO). No intenta ser un parser universal:
 * cubre exactamente las migraciones de este proyecto.
 */
function splitSql(source) {
  const statements = [];
  let current = '';
  let index = 0;
  let single = false;
  let lineComment = false;
  let blockComment = false;
  let dollarTag = null;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      current += char;
      if (char === '\n') lineComment = false;
      index += 1;
      continue;
    }

    if (blockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        index += 2;
        blockComment = false;
        continue;
      }
      index += 1;
      continue;
    }

    if (dollarTag) {
      if (source.startsWith(dollarTag, index)) {
        current += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += char;
      index += 1;
      continue;
    }

    if (single) {
      current += char;
      if (char === "'") {
        if (next === "'") {
          current += next;
          index += 2;
          continue;
        }
        single = false;
      }
      index += 1;
      continue;
    }

    if (char === '-' && next === '-') {
      current += char + next;
      index += 2;
      lineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      current += char + next;
      index += 2;
      blockComment = true;
      continue;
    }

    if (char === "'") {
      current += char;
      single = true;
      index += 1;
      continue;
    }

    if (char === '$') {
      const match = source.slice(index).match(/^\$[A-Za-z_0-9]*\$/);
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        index += dollarTag.length;
        continue;
      }
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);

  return statements.filter((statement) => !/^(begin|commit)$/i.test(statement));
}

const sql = neon(url);

for (const file of FILES) {
  const source = fs.readFileSync(new URL(`../db/migrations/${file}`, import.meta.url), 'utf8');
  const statements = splitSql(source);
  console.log(`${file}: ${statements.length} sentencias`);

  for (const [position, statement] of statements.entries()) {
    try {
      await sql.query(statement);
    } catch (error) {
      console.error(`${file}, sentencia ${position + 1}: ${error.message}`);
      process.exit(1);
    }
  }
}

console.log('Migraciones aplicadas.');
