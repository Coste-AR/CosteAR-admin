import { useState } from 'react';
import { useSystemAlerts, useResolveSystemAlert } from '../hooks/useSystemAlerts';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, ExternalLink, CheckCircle, RefreshCcw } from 'lucide-react';

export function SystemAlertsPage() {
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);
  const { data: alerts, isLoading, isError, refetch, isFetching } = useSystemAlerts(unresolvedOnly);
  const { mutate: resolveAlert, isPending: isResolving } = useResolveSystemAlert();

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Alertas de Sistema (Sentry)
          </h1>
          <p className="text-gray-500 mt-1">Monitoreo en tiempo real de errores críticos y excepciones en producción.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setUnresolvedOnly(!unresolvedOnly)}>
            {unresolvedOnly ? 'Ver todas (Incluir resueltas)' : 'Ver solo pendientes'}
          </Button>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-line/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-line/40 text-ink-soft text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Nivel</th>
              <th className="px-6 py-4 font-semibold">Mensaje</th>
              <th className="px-6 py-4 font-semibold">Origen</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/20">
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Cargando alertas...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-danger">
                  Error al cargar las alertas.
                </td>
              </tr>
            )}
            {alerts?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
                  No hay alertas pendientes. ¡El sistema está saludable!
                </td>
              </tr>
            )}
            {alerts?.map((alert) => (
              <tr key={alert.id} className={`hover:bg-surface-alt transition-colors ${alert.resolvedAt ? 'opacity-60 bg-surface' : ''}`}>
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
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap flex justify-end gap-2 items-center h-full">
                  {alert.sentryUrl && (
                    <a href={alert.sentryUrl} target="_blank" rel="noreferrer">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
