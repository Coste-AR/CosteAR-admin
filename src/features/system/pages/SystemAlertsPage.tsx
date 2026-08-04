import { useState, Fragment } from 'react';
import { useSystemAlerts, useResolveSystemAlert, type SystemAlert } from '../hooks/useSystemAlerts';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, ExternalLink, CheckCircle, RefreshCcw, ChevronDown, ChevronRight, MapPin, Repeat, Clock, Cpu } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';

// Defensa en profundidad: el backend ya sanitiza sentryUrl, pero esto además
// protege contra alertas viejas guardadas antes del fix (o cualquier otra
// fuente futura de 'source') que pudieran traer un esquema no-http (javascript:, data:, etc.).
const safeUrl = (url?: string | null) => (url && /^https?:\/\//i.test(url) ? url : undefined);

const getBadgeColor = (level: string) => {
  switch (level) {
    case 'fatal':
      return 'bg-danger text-white';
    case 'error':
      return 'bg-orange-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
};

export function SystemAlertsPage() {
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: alerts, isLoading, isError, refetch, isFetching } = useSystemAlerts(unresolvedOnly);
  const { mutate: resolveAlert, isPending: isResolving } = useResolveSystemAlert();

  return (
    <AppShell wide>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 shrink-0" /> Alertas de Sistema (Sentry)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Monitoreo en tiempo real de errores críticos y excepciones en producción.</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button variant="secondary" onClick={() => setUnresolvedOnly(!unresolvedOnly)}>
            {unresolvedOnly ? 'Ver todas (Incluir resueltas)' : 'Ver solo pendientes'}
          </Button>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-center py-8 text-gray-500">Cargando alertas...</p>}
      {isError && <p className="text-center py-8 text-danger">Error al cargar las alertas.</p>}
      {!isLoading && !isError && alerts?.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow border border-line/40">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
          No hay alertas pendientes. ¡El sistema está saludable!
        </div>
      )}

      {!isLoading && !isError && alerts && alerts.length > 0 && (
        <>
          {/* Tabla: solo desde lg, es la única forma de que 6 columnas entren sin scroll */}
          <div className="hidden lg:block bg-white rounded-xl shadow border border-line/40 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-line/40 text-ink-soft text-sm uppercase tracking-wider">
                  <th className="px-3 py-4" />
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Nivel</th>
                  <th className="px-6 py-4 font-semibold">Mensaje</th>
                  <th className="px-6 py-4 font-semibold">Origen</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/20">
                {alerts.map((alert) => {
                  const expanded = expandedId === alert.id;
                  return (
                    <Fragment key={alert.id}>
                      <tr
                        onClick={() => setExpandedId(expanded ? null : alert.id)}
                        className={`hover:bg-surface-alt transition-colors cursor-pointer ${alert.resolvedAt ? 'opacity-60 bg-surface' : ''}`}
                      >
                        <td className="px-3 py-4 text-ink-soft">
                          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                          {new Date(alert.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getBadgeColor(alert.level)}`}>
                            {alert.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-ink max-w-md truncate" title={alert.message}>
                          {alert.message}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-line/60 text-ink-soft">
                            {alert.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap flex justify-end gap-2 items-center h-full" onClick={(e) => e.stopPropagation()}>
                          {safeUrl(alert.sentryUrl) && (
                            <a href={safeUrl(alert.sentryUrl)} target="_blank" rel="noreferrer noopener">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4 mr-1" /> Sentry
                              </Button>
                            </a>
                          )}
                          {!alert.resolvedAt && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              disabled={isResolving}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Resolver
                            </Button>
                          )}
                          {alert.resolvedAt && (
                            <span className="text-xs text-green-600 font-bold px-3 py-1 bg-green-50 rounded-full">Resuelta</span>
                          )}
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-surface-alt/60">
                          <td colSpan={6} className="px-6 py-5">
                            <AlertDetail alert={alert} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas: debajo de lg, cada alerta es su propia tarjeta expandible */}
          <div className="lg:hidden space-y-3">
            {alerts.map((alert) => {
              const expanded = expandedId === alert.id;
              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl shadow border border-line/40 overflow-hidden ${alert.resolvedAt ? 'opacity-60' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : alert.id)}
                    className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 mt-1 shrink-0 text-ink-soft" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mt-1 shrink-0 text-ink-soft" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getBadgeColor(alert.level)}`}>
                          {alert.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-line/60 text-ink-soft">
                          {alert.source}
                        </span>
                        {alert.resolvedAt && (
                          <span className="text-[10px] text-green-600 font-bold px-2 py-0.5 bg-green-50 rounded-full">Resuelta</span>
                        )}
                      </div>
                      <p className="font-medium text-ink text-sm mt-1.5 break-words">{alert.message}</p>
                      <p className="text-xs text-ink-soft mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-line/40 bg-surface-alt/60 px-4 py-4 space-y-4">
                      <AlertDetail alert={alert} />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {safeUrl(alert.sentryUrl) && (
                          <a href={safeUrl(alert.sentryUrl)} target="_blank" rel="noreferrer noopener">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" /> Sentry
                            </Button>
                          </a>
                        )}
                        {!alert.resolvedAt && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            disabled={isResolving}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      </div>
    </AppShell>
  );
}

/**
 * Todo lo que el webhook de Sentry manda y antes se descartaba (culprit,
 * tipo/valor de la excepción, cantidad de veces, primera/última vez visto).
 * NO es el stack trace ni los breadcrumbs — Sentry no los manda en la alerta
 * de issue, solo en el evento completo vía su API (necesita un token que hoy
 * no está configurado). Para eso está el link "Ver en Sentry" de la fila.
 */
function AlertDetail({ alert }: { alert: SystemAlert }) {
  const hasExtra = alert.culprit || alert.errorType || alert.errorValue || alert.occurrenceCount != null || alert.firstSeenAt || alert.lastSeenAt || alert.platform;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1">Mensaje completo</p>
        <p className="text-sm text-ink whitespace-pre-wrap break-words font-mono bg-white border border-line/60 rounded-lg p-3">
          {alert.message}
        </p>
      </div>

      {alert.errorValue && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1">
            {alert.errorType ? `${alert.errorType} —` : ''} Detalle de la excepción
          </p>
          <p className="text-sm text-ink whitespace-pre-wrap break-words font-mono bg-white border border-line/60 rounded-lg p-3">
            {alert.errorValue}
          </p>
        </div>
      )}

      {hasExtra ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {alert.culprit && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Dónde</p>
                <p className="text-xs text-ink break-all">{alert.culprit}</p>
              </div>
            </div>
          )}
          {alert.occurrenceCount != null && (
            <div className="flex items-start gap-2">
              <Repeat className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Ocurrencias</p>
                <p className="text-xs text-ink">{alert.occurrenceCount}</p>
              </div>
            </div>
          )}
          {(alert.firstSeenAt || alert.lastSeenAt) && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Visto</p>
                <p className="text-xs text-ink">
                  {alert.firstSeenAt ? new Date(alert.firstSeenAt).toLocaleString() : '—'}
                  {' → '}
                  {alert.lastSeenAt ? new Date(alert.lastSeenAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          )}
          {alert.platform && (
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-ink-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Plataforma</p>
                <p className="text-xs text-ink">{alert.platform}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-soft italic">
          Esta alerta se guardó antes de que empezáramos a capturar dónde/qué/cuántas veces — solo tiene el mensaje. Las nuevas van a traer el detalle completo.
        </p>
      )}
    </div>
  );
}
