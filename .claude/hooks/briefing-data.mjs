const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';
const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function parsearLista(valor) {
  if (valor === null) return null;
  try {
    const lista = JSON.parse(valor);
    return Array.isArray(lista) ? lista : null;
  } catch {
    return null;
  }
}

function fechaArgentina(fecha) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_ARGENTINA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')} ${valor('hour')}:${valor('minute')}`;
}

export function leerModoTrabajo(consultar) {
  const modo = consultar('modo')?.trim().toLowerCase();
  return modo
    ? `Modo de trabajo: ${modo}`
    : 'Modo de trabajo: NO DECLARADO (no se pudo leer la variable)';
}

export function leerMensajesAgente(consultar, { ahora = new Date() } = {}) {
  const errores = [];
  const repo = consultar('repo');
  if (!repo) {
    return {
      mensajes: [],
      errores: ['No se pudo identificar el repo para leer mensajes /agente.'],
    };
  }

  const leerNumeros = (clave, descripcion) => {
    const lista = parsearLista(consultar(clave, { repo }));
    if (lista === null) {
      errores.push(`No se pudieron leer ${descripcion}.`);
      return [];
    }
    return lista.map(({ number }) => Number(number)).filter(Number.isInteger);
  };

  const numerosIssues = new Set([
    ...leerNumeros('issues:listo', 'los issues abiertos con etiqueta listo'),
    ...leerNumeros('issues:bloqueado', 'los issues abiertos con etiqueta bloqueado'),
  ]);
  const numerosPrs = new Set(leerNumeros('prs', 'los PRs abiertos'));
  const desde = new Date(ahora.getTime() - SIETE_DIAS_MS).toISOString();
  const paginasComentarios = parsearLista(consultar('comments', { repo, desde }));
  if (paginasComentarios === null) {
    errores.push('No se pudieron leer los comentarios /agente.');
    return { mensajes: [], errores };
  }
  const comentarios = paginasComentarios.flatMap((pagina) => Array.isArray(pagina) ? pagina : [pagina]);

  const mensajes = comentarios
    .filter(({ body }) => typeof body === 'string' && body.startsWith('/agente'))
    .map((comentario) => {
      const numero = Number(comentario.issue_url?.match(/\/issues\/(\d+)$/)?.[1]);
      const fecha = new Date(comentario.created_at);
      return { ...comentario, numero, fecha };
    })
    .filter(({ numero, fecha }) =>
      (numerosIssues.has(numero) || numerosPrs.has(numero)) &&
      !Number.isNaN(fecha.getTime()) &&
      fecha.getTime() >= ahora.getTime() - SIETE_DIAS_MS &&
      fecha.getTime() <= ahora.getTime()
    )
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .map(({ body, fecha, numero, user }) => {
      const referencia = numerosPrs.has(numero) ? `PR #${numero}` : `#${numero}`;
      return `${fechaArgentina(fecha)} · ${user?.login ?? 'autor desconocido'} · ${referencia}\n${body}`;
    });

  return { mensajes, errores };
}
