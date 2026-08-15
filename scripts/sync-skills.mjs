#!/usr/bin/env node
/**
 * Propaga las skills del equipo desde este repo (copia canónica) a los otros repos de CosteAR.
 *
 *   npm run skills:sync
 *
 * Por qué existe: Claude Code solo descubre las skills que están en el `.claude/skills/` del
 * repo donde estás trabajando. Como tenemos tres repos separados, las skills tienen que estar
 * commiteadas en los tres — así a Alan y a Juli les aparecen solas con un `git pull`, sin
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
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
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
