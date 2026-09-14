import assert from 'node:assert/strict';
import test from 'node:test';

import { leerModoTrabajo, leerMensajesAgente } from './briefing-data.mjs';

const comentarioIssue = {
  created_at: '2026-09-13T20:04:33Z',
  issue_url: 'https://api.github.com/repos/Coste-AR/CosteAR-admin/issues/98',
  body: '/agente mensaje del issue',
  user: { login: 'santiago' },
};

const comentarioPr = {
  created_at: '2026-09-13T19:00:00Z',
  issue_url: 'https://api.github.com/repos/Coste-AR/CosteAR-admin/issues/101',
  body: '/agente mensaje del PR',
  user: { login: 'alan' },
};

const comentarioComun = {
  created_at: '2026-09-13T18:00:00Z',
  issue_url: 'https://api.github.com/repos/Coste-AR/CosteAR-admin/issues/98',
  body: 'esto no es para el agente',
  user: { login: 'otra-persona' },
};

test('muestra mensajes /agente de issues listos y PR abiertos, en orden y hora argentina', () => {
  const respuestas = new Map([
    ['repo', 'Coste-AR/CosteAR-admin'],
    ['issues:listo', JSON.stringify([{ number: 98 }])],
    ['issues:bloqueado', '[]'],
    ['prs', JSON.stringify([{ number: 101 }])],
    ['comments', JSON.stringify([comentarioIssue, comentarioComun, comentarioPr])],
  ]);

  const resultado = leerMensajesAgente((clave) => respuestas.get(clave) ?? null, {
    ahora: new Date('2026-09-13T23:00:00Z'),
  });

  assert.deepEqual(resultado.errores, []);
  assert.deepEqual(resultado.mensajes, [
    '2026-09-13 16:00 · alan · PR #101\n/agente mensaje del PR',
    '2026-09-13 17:04 · santiago · #98\n/agente mensaje del issue',
  ]);
  assert.ok(!resultado.mensajes.join('\n').includes('otra-persona'));
});

test('informa cuando MODO_TRABAJO no se puede leer y no interrumpe', () => {
  assert.equal(
    leerModoTrabajo(() => null),
    'Modo de trabajo: NO DECLARADO (no se pudo leer la variable)',
  );
});

test('declara que no hay mensajes cuando la consulta devuelve cero comentarios', () => {
  const respuestas = new Map([
    ['repo', 'Coste-AR/CosteAR-admin'],
    ['issues:listo', '[]'],
    ['issues:bloqueado', '[]'],
    ['prs', '[]'],
    ['comments', '[]'],
  ]);

  const resultado = leerMensajesAgente((clave) => respuestas.get(clave) ?? null, {
    ahora: new Date('2026-09-13T23:00:00Z'),
  });

  assert.deepEqual(resultado, { mensajes: [], errores: [] });
});

