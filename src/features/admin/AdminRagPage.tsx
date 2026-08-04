import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { RagChat } from './components/RagChat';

export function AdminRagPage() {
  return (
    <AppShell wide>
      {/* h-full + flex-1 min-h-0: RagChat necesita saber cuánto espacio
          vertical tiene DE VERDAD para su propio scroll interno. Antes se
          adivinaba con un `calc(100vh - ...)` pensado para escritorio, que en
          mobile no descontaba el nav inferior fijo y dejaba el cuadro de
          texto tapado. */}
      <div className="flex h-full w-full mx-auto flex-col animate-in fade-in duration-500">
        <PageHeader
          title="Consola IA"
          description="Chat maestro para consultar la Bóveda de Conocimiento sin restricciones."
        />
        <div className="mt-8 flex-1 min-h-0">
          <RagChat />
        </div>
      </div>
    </AppShell>
  );
}
