import { useState, useEffect } from 'react';
import { Building2, ChevronRight, Save, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { useIndustryProfiles, useUpdateIndustryProfileMutation, type IndustryProfile } from '../admin-hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function keywordsToText(arr: string[]): string {
  return arr.join('\n');
}

function textToKeywords(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface EditorState {
  label: string;
  mpKeywords: string;
  cipKeywords: string;
  modKeywords: string;
  eventKeywords: string;
  lossKeywords: string;
  detectPatterns: string;
  measurementUnit: string;
  energyIsMP: boolean;
  fuelIsMP: boolean;
  isActive: boolean;
}

function profileToEditorState(p: IndustryProfile): EditorState {
  return {
    label: p.label,
    mpKeywords: keywordsToText(p.mpKeywords),
    cipKeywords: keywordsToText(p.cipKeywords),
    modKeywords: keywordsToText(p.modKeywords),
    eventKeywords: keywordsToText(p.eventKeywords),
    lossKeywords: keywordsToText(p.lossKeywords),
    detectPatterns: keywordsToText(p.detectPatterns),
    measurementUnit: p.measurementUnit ?? '',
    energyIsMP: p.energyIsMP,
    fuelIsMP: p.fuelIsMP,
    isActive: p.isActive,
  };
}

function KeywordsField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const count = textToKeywords(value).length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
          <Tag className="size-3" />
          {label}
        </label>
        <span className="text-[10px] text-ink-soft font-medium">{count} palabras</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full border border-line bg-surface-alt rounded-lg p-2.5 text-xs font-mono text-ink focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
        placeholder="una por línea"
      />
      {hint && <p className="text-[10px] text-ink-soft mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-surface-alt transition-colors"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      {value ? (
        <ToggleRight className="size-5 text-amber-500" />
      ) : (
        <ToggleLeft className="size-5 text-ink-soft" />
      )}
    </button>
  );
}

function ProfileEditor({
  profile,
  onClose,
}: {
  profile: IndustryProfile;
  onClose: () => void;
}) {
  const { mutateAsync: update, isPending } = useUpdateIndustryProfileMutation();
  const [state, setState] = useState<EditorState>(() => profileToEditorState(profile));

  useEffect(() => {
    setState(profileToEditorState(profile));
  }, [profile.id]);

  const set = <K extends keyof EditorState>(key: K, val: EditorState[K]) =>
    setState((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    await update({
      category: profile.category,
      data: {
        label: state.label.trim() || undefined,
        mpKeywords: textToKeywords(state.mpKeywords),
        cipKeywords: textToKeywords(state.cipKeywords),
        modKeywords: textToKeywords(state.modKeywords),
        eventKeywords: textToKeywords(state.eventKeywords),
        lossKeywords: textToKeywords(state.lossKeywords),
        detectPatterns: textToKeywords(state.detectPatterns),
        measurementUnit: state.measurementUnit.trim() || null,
        energyIsMP: state.energyIsMP,
        fuelIsMP: state.fuelIsMP,
        isActive: state.isActive,
      },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
            {profile.category}
          </span>
          <h3 className="text-base font-extrabold text-ink mt-1">{profile.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-ink-soft hover:text-ink text-xl font-bold leading-none px-2 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
            Nombre para mostrar
          </label>
          <input
            type="text"
            value={state.label}
            onChange={(e) => set('label', e.target.value)}
            className="w-full border border-line bg-surface-alt rounded-lg p-2.5 text-sm font-medium text-ink focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
            Unidad de medida
          </label>
          <input
            type="text"
            value={state.measurementUnit}
            onChange={(e) => set('measurementUnit', e.target.value)}
            className="w-full border border-line bg-surface-alt rounded-lg p-2.5 text-sm font-medium text-ink focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            placeholder="Ej. cajón, kg, tonelada"
          />
        </div>

        <div className="border border-line rounded-xl overflow-hidden">
          <Toggle label="Energía es Materia Prima" value={state.energyIsMP} onChange={(v) => set('energyIsMP', v)} />
          <div className="border-t border-line" />
          <Toggle label="Combustible es Materia Prima" value={state.fuelIsMP} onChange={(v) => set('fuelIsMP', v)} />
          <div className="border-t border-line" />
          <Toggle label="Perfil activo" value={state.isActive} onChange={(v) => set('isActive', v)} />
        </div>

        <KeywordsField
          label="Palabras clave — Materia Prima"
          value={state.mpKeywords}
          onChange={(v) => set('mpKeywords', v)}
          hint="El clasificador las usa para identificar compras de MP"
        />
        <KeywordsField
          label="Palabras clave — CIP"
          value={state.cipKeywords}
          onChange={(v) => set('cipKeywords', v)}
        />
        <KeywordsField
          label="Palabras clave — MOD"
          value={state.modKeywords}
          onChange={(v) => set('modKeywords', v)}
        />
        <KeywordsField
          label="Palabras clave — Eventos"
          value={state.eventKeywords}
          onChange={(v) => set('eventKeywords', v)}
          hint="Eventos productivos (postura, crianza, faena...)"
        />
        <KeywordsField
          label="Palabras clave — Pérdidas"
          value={state.lossKeywords}
          onChange={(v) => set('lossKeywords', v)}
        />
        <KeywordsField
          label="Patrones de detección de rubro"
          value={state.detectPatterns}
          onChange={(v) => set('detectPatterns', v)}
          hint="Patrones que activan la detección automática de este rubro"
        />
      </div>

      <div className="px-6 py-4 border-t border-line shrink-0">
        <Button
          onClick={handleSave}
          loading={isPending}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2 justify-center"
        >
          <Save className="size-4" />
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}

export function IndustryProfiles() {
  const { data: profiles, isLoading } = useIndustryProfiles();
  const [selected, setSelected] = useState<IndustryProfile | null>(null);

  const active = profiles?.filter((p) => p.isActive) ?? [];
  const inactive = profiles?.filter((p) => !p.isActive) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="relative overflow-hidden bg-surface p-6 sm:p-8 rounded-[24px] border border-line shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50">
              <Building2 className="size-5" />
            </div>
            Perfiles de Industria
          </h2>
          <p className="text-sm text-ink-soft mt-2 max-w-lg leading-relaxed">
            Configurá las palabras clave y parámetros que el clasificador usa para cada rubro productivo.
            Hacé clic en un perfil para editarlo.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-bold text-ink">{profiles?.length ?? '—'} perfiles en total</span>
            <span className="text-ink-soft">·</span>
            <span className="text-emerald-600 font-bold">{active.length} activos</span>
            {inactive.length > 0 && (
              <>
                <span className="text-ink-soft">·</span>
                <span className="text-ink-soft font-bold">{inactive.length} inactivos</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? 'lg:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>
        <Card className="overflow-hidden border-line bg-surface">
          {isLoading ? (
            <div className="p-8 text-center text-ink-soft font-medium animate-pulse">
              Cargando perfiles...
            </div>
          ) : !profiles?.length ? (
            <div className="p-8 text-center text-ink-soft font-medium">
              No hay perfiles cargados. Corré el seed de industry profiles.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {profiles.map((p) => {
                const isSelected = selected?.id === p.id;
                const totalKeywords =
                  p.mpKeywords.length +
                  p.cipKeywords.length +
                  p.modKeywords.length +
                  p.eventKeywords.length +
                  p.lossKeywords.length;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelected(isSelected ? null : p)}
                      className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-amber-50/50 ${
                        isSelected ? 'bg-amber-50 border-l-2 border-amber-500' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-ink text-sm">{p.label}</span>
                          <span className="text-[9.5px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full">
                            {p.category}
                          </span>
                          {!p.isActive && (
                            <span className="text-[9.5px] font-bold uppercase tracking-widest text-ink-soft bg-surface-alt border border-line px-1.5 py-0.5 rounded-full">
                              inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft mt-1">
                          {totalKeywords} palabras clave
                          {p.measurementUnit && ` · unidad: ${p.measurementUnit}`}
                          {(p.energyIsMP || p.fuelIsMP) && (
                            <span className="ml-1 text-amber-600">
                              {[p.energyIsMP && 'energía=MP', p.fuelIsMP && 'combustible=MP']
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight
                        className={`size-4 text-ink-soft shrink-0 transition-transform ${isSelected ? 'rotate-90 text-amber-500' : ''}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {selected && (
          <Card className="border-line bg-surface overflow-hidden flex flex-col max-h-[75vh] lg:max-h-none">
            <ProfileEditor profile={selected} onClose={() => setSelected(null)} />
          </Card>
        )}
      </div>
    </div>
  );
}
