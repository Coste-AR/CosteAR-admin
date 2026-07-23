import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/features/auth/auth-hooks';
import { CosteARLogo } from '@/components/layout/CosteARLogo';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-line/40 px-1 py-4 lg:px-8 lg:py-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-granate text-white lg:hidden">
          <CosteARLogo className="h-5 w-auto text-white" />
        </div>
        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-granate-deep/70 bg-granate-tenue/60 px-3 py-1 rounded-full border border-granate/10 lg:inline-block">
          Panel de Control
        </span>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="hidden items-center gap-2.5 rounded-full border border-line bg-surface-alt/80 px-3.5 py-1.5 shadow-sm lg:flex">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-6.5 shrink-0 rounded-full object-cover border border-line" />
          ) : (
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-granate-tenue text-[10.5px] font-extrabold text-granate border border-granate/10">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </span>
          )}
          <div className="text-left leading-none pr-1">
            <p className="text-[11.5px] font-bold text-ink">{user?.name ?? 'Admin'}</p>
            <p className="text-[8.5px] text-ink-soft mt-0.5 font-bold uppercase tracking-wider">Administrador</p>
          </div>
        </div>

        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-surface-alt/80 p-1 pr-2 shadow-sm"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover border border-line" />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-granate-tenue text-[11px] font-extrabold text-granate border border-granate/10">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            )}
            <Menu className="size-3.5 text-ink-soft" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-line bg-white p-1.5 shadow-[0_20px_50px_rgba(74,21,27,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout.mutate(undefined, { onSettled: () => { window.location.href = '/login'; } });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
