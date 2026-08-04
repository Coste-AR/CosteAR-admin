import { useEffect, useState } from 'react';
import { ScrollText, History, Send } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { apiErrorMessage } from '@/lib/api';
import { useTermsVersions, usePublishTerms } from './useTerms';

/**
 * Editor de Términos y Condiciones — SOLO ADMIN (gateado por el router, ver
 * router.tsx: requireAdmin en la ruta /admin/terms).
 *
 * "Editar" acá en realidad PUBLICA una versión nueva: nunca se muta el
 * contenido de una versión ya vigente, porque `TermsAcceptance` apunta a un
 * termsVersionId puntual — es la prueba de qué aceptó cada usuario, y tiene
 * que quedar fija para siempre. Publicar además fuerza a TODOS los costistas
 * existentes a re-aceptar en su próximo ingreso (o antes, si la sesión sigue
 * abierta) — por eso pide confirmación explícita.
 */
export function TermsAdminPage() {
  const { data: versions, isLoading, isError } = useTermsVersions();
  const publish = usePublishTerms();
  const [draft, setDraft] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const current = versions?.[0]; // el service devuelve orderBy version desc

  // Al cargar (o al publicar con éxito) el borrador arranca desde la vigente.
  useEffect(() => {
    if (current && !selectedHistoryId) setDraft(current.content);
  }, [current, selectedHistoryId]);

  const dirty = current ? draft !== current.content : draft.length > 0;
  const viewingHistory = selectedHistoryId != null && selectedHistoryId !== current?.id;

  const handlePublish = async () => {
    setError(null);
    try {
      await publish.mutateAsync(draft);
      setConfirming(false);
      setSelectedHistoryId(null);
    } catch (err) {
      setError(apiErrorMessage(err));
      setConfirming(false);
    }
  };

  return (
    <AppShell wide>
      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <ScrollText className="size-6 text-granate" />
          <div>
            <h1 className="text-2xl font-bold text-ink">Términos y Condiciones</h1>
            <p className="text-sm text-ink-soft">
              Publicar una versión nueva obliga a todos los costistas a volver a aceptarla.
            </p>
          </div>
        </div>

        {isLoading && <p className="text-ink-soft">Cargando…</p>}
        {isError && <p className="font-semibold text-danger">No se pudo cargar el historial de versiones.</p>}

        {versions && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            <div className="rounded-xl border border-line bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="text-sm font-bold text-ink">
                  {viewingHistory
                    ? `Viendo versión histórica (v${versions.find((v) => v.id === selectedHistoryId)?.version})`
                    : `Versión vigente: v${current?.version ?? '—'}`}
                </span>
                {viewingHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedHistoryId(null);
                      if (current) setDraft(current.content);
                    }}
                  >
                    Volver a la vigente
                  </Button>
                )}
              </div>

              <textarea
                className="h-[60vh] w-full resize-none border-0 p-5 font-mono text-[12.5px] leading-relaxed text-ink focus:outline-none disabled:bg-surface-alt disabled:text-ink-soft"
                value={draft}
                disabled={viewingHistory}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Contenido en Markdown/texto plano…"
              />

              {error && (
                <div className="mx-5 mb-3 rounded-sm bg-danger/10 px-3 py-2 text-[13px] text-danger">{error}</div>
              )}

              {!viewingHistory && (
                <div className="flex items-center justify-between border-t border-line px-5 py-3">
                  <span className="text-[12px] text-ink-soft">
                    {dirty ? 'Hay cambios sin publicar.' : 'Sin cambios respecto a la versión vigente.'}
                  </span>
                  <Button size="sm" onClick={() => setConfirming(true)} disabled={!dirty || draft.trim().length < 50}>
                    <Send className="size-4" /> Publicar nueva versión
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-line bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <History className="size-4 text-ink-soft" />
                <span className="text-sm font-bold text-ink">Historial</span>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {versions.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHistoryId(v.id);
                        setDraft(v.content);
                      }}
                      className={`w-full border-b border-line/60 px-4 py-3 text-left text-[12.5px] transition-colors hover:bg-surface-alt ${
                        (selectedHistoryId ?? current?.id) === v.id ? 'bg-granate-tenue' : ''
                      }`}
                    >
                      <div className="font-bold text-ink">
                        v{v.version} {v.id === current?.id && <span className="text-[10px] text-granate">(vigente)</span>}
                      </div>
                      <div className="text-ink-soft">{new Date(v.createdAt).toLocaleString('es-AR')}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Publicar nueva versión"
        message={
          <>
            Esto crea la versión <strong>v{(current?.version ?? 0) + 1}</strong> y la vuelve la vigente. A partir de
            ahora, todos los costistas que ya tenían cuenta van a tener que aceptarla de nuevo antes de poder seguir
            usando la plataforma — algunos lo van a ver de inmediato (si tienen la app abierta), el resto en su
            próximo ingreso. ¿Confirmás?
          </>
        }
        confirmLabel="Publicar"
        loading={publish.isPending}
        onConfirm={() => void handlePublish()}
        onCancel={() => setConfirming(false)}
      />
    </AppShell>
  );
}
