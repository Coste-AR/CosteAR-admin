#!/usr/bin/env node
/**
 * Propaga las skills del equipo desde este repo (copia canónica) a los otros repos de CosteAR.
 *
 *   npm run skills:sync
 *
 * Por qué existe: Claude Code solo descubre las skills que están en el `.claude/skills/` del
 * repo donde estás trabajando. Como tenemos tres repos separados, las skills tienen que estar
 * commiteadas en los tres — así le aparecen solas a todo el equipo con un `git pull`, sin
 * instalar nada. Este script evita que las tres copias se desincronicen.
 *
 * La copia canónica es la de ESTE repo. Nunca editar las copias de backend o frontend a mano:
 * se edita acá y se corre el sync.
 *
 * Cómo encuentra los otros repos, en orden:
 *   1. Variables de entorno COSTEAR_BACKEND_PATH / COSTEAR_FRONTEND_PATH
 *   2. git config costear.backendPath / costear.frontendPath  (por máquina, no se commitea)
 *   3. Ubicaciones habituales relativas a este repo
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(HERE, '.claude', 'skills');

/** Lee una clave de la config local de git. Devuelve null si no está. */
function gitConfig(key) {
  try {
    return execFileSync('git', ['config', '--get', key], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

/** Resuelve la ruta de un repo hermano probando las tres fuentes, en orden. */
function resolveRepo({ nombre, envVar, configKey, candidatos }) {
  const desdeEnv = process.env[envVar];
  if (desdeEnv && existsSync(desdeEnv)) return desdeEnv;

  const desdeConfig = gitConfig(configKey);
  if (desdeConfig && existsSync(desdeConfig)) return desdeConfig;

  for (const candidato of candidatos) {
    const ruta = resolve(HERE, candidato);
    if (existsSync(join(ruta, '.git'))) return ruta;
  }

  console.warn(
    `⚠️  No encontré ${nombre}. Decile dónde está con:\n` +
      `      git config ${configKey} "<ruta absoluta>"\n` +
      `   o exportando ${envVar}.`,
  );
  return null;
}

const DESTINOS = [
  {
    nombre: 'CosteAR-backend',
    envVar: 'COSTEAR_BACKEND_PATH',
    configKey: 'costear.backendPath',
    candidatos: ['../../costear-api/CosteAR-backend', '../CosteAR-backend', '../../CosteAR-backend'],
  },
  {
    nombre: 'CosteAR-frontend',
    envVar: 'COSTEAR_FRONTEND_PATH',
    configKey: 'costear.frontendPath',
    candidatos: [
      '../../costear-client/CosteAR-frontend',
      '../CosteAR-frontend',
      '../../CosteAR-frontend',
    ],
  },
];

if (!existsSync(SKILLS_DIR)) {
  console.error(`✗ No existe ${SKILLS_DIR}. ¿Estás corriendo esto desde CosteAR-admin?`);
  process.exit(1);
}

const skills = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith('costear-'))
  .map((e) => e.name);

if (skills.length === 0) {
  console.error('✗ No hay skills `costear-*` para sincronizar.');
  process.exit(1);
}

console.log(`Skills a propagar (${skills.length}): ${skills.join(', ')}\n`);


/**
 * GUARDIA DE DATOS DEL CLIENTE (CLI-01).
 *
 * Este repo es PRIVADO; backend y frontend son PUBLICOS. Sin este chequeo, el sync
 * publica hacia afuera cualquier nombre de cliente que se haya escrito aca adentro
 * — y encima lo hace REVIRTIENDO una anonimizacion previa, porque sobreescribe el
 * destino.
 *
 * No es hipotetico: el 22-08-2026 el sync intento reponer el nombre de pila del
 * betatester en `costear-issue`, donde ya estaba anonimizado en el repo publico. El
 * 18-08 ya se habia publicado la estructura de costos de ese mismo cliente, y el
 * historial de git es permanente.
 *
 * Ante una coincidencia CORTA y no copia nada: es mas barato revisar un falso
 * positivo que despublicar un dato.
 */
const TERMINOS_PROHIBIDOS = [/\bAugusto\b/i, /pico\s+de\s+oro/i, /av[ií]cola\s+saenz/i];

const hallazgos = [];
for (const skill of skills) {
  const dir = join(SKILLS_DIR, skill);
  for (const entrada of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entrada.isFile()) continue;
    const ruta = join(entrada.parentPath ?? entrada.path ?? dir, entrada.name);
    const contenido = readFileSync(ruta, 'utf-8');
    for (const re of TERMINOS_PROHIBIDOS) {
      const m = contenido.match(re);
      if (m) hallazgos.push(`  ${skill}/${entrada.name}: "${m[0]}"`);
    }
  }
}

if (hallazgos.length > 0) {
  console.error('\n✗ DATOS DE CLIENTE EN LAS SKILLS - no se sincroniza nada (CLI-01).\n');
  console.error(hallazgos.join('\n'));
  console.error(
    '\nbackend y frontend son repos PUBLICOS y el historial de git es permanente.\n' +
      'Saca el dato de la copia canonica de este repo y volve a correr el sync.',
  );
  process.exit(1);
}

let sincronizados = 0;

for (const destino of DESTINOS) {
  const ruta = resolveRepo(destino);
  if (!ruta) continue;

  const target = join(ruta, '.claude', 'skills');
  mkdirSync(target, { recursive: true });

  for (const skill of skills) {
    const destinoSkill = join(target, skill);
    // Se borra primero para que un archivo eliminado acá también desaparezca allá.
    rmSync(destinoSkill, { recursive: true, force: true });
    cpSync(join(SKILLS_DIR, skill), destinoSkill, { recursive: true });
  }

  console.log(`✓ ${destino.nombre} → ${target}`);
  sincronizados++;
}

if (sincronizados === 0) {
  console.error('\n✗ No se sincronizó ningún repo.');
  process.exit(1);
}

console.log(
  `\nListo: ${sincronizados} repo(s) actualizados.\n` +
    'Acordate de commitear los cambios en cada repo — las skills se distribuyen por git.',
);
