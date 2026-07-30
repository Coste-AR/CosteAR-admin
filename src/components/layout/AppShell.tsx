import { useState, useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  FileCheck2,
  Users as UsersIcon,
  MessageSquareText,
  AlertTriangle,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/features/auth/auth-hooks";
import { CosteARLogo } from "@/components/layout/CosteARLogo";
import { TopBar } from "@/components/layout/TopBar";

const NAV = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Gestión de Staff", icon: UsersIcon },
  { to: "/admin/vault", label: "Entrenamiento Bóveda", icon: FileCheck2 },
  { to: "/admin/chat", label: "Consola IA", icon: MessageSquareText },
  { to: "/admin/system-alerts", label: "Alertas", icon: AlertTriangle },
  { to: "/admin/terms", label: "Términos y Condiciones", icon: ScrollText },
] as const;

function isNavActive(pathname: string, item: (typeof NAV)[number]): boolean {
  if ("exact" in item && item.exact) return pathname === item.to;
  if (pathname.startsWith(item.to)) return true;
  return false;
}

export function AppShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const logout = useLogout();
  const { location } = useRouterState();

  const activeNavItems = NAV;

  const activeIndex = activeNavItems.findIndex((item) =>
    isNavActive(location.pathname, item),
  );
  const [prevIndex, setPrevIndex] = useState(activeIndex);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (activeIndex !== -1 && prevIndex !== -1 && activeIndex !== prevIndex) {
      setIsMoving(true);
      setDirection(activeIndex > prevIndex ? "down" : "up");
      setDistance(Math.abs(activeIndex - prevIndex));
      setPrevIndex(activeIndex);
      const timer = setTimeout(() => {
        setIsMoving(false);
        setDirection(null);
        setDistance(0);
      }, 320);
      return () => clearTimeout(timer);
    } else if (activeIndex !== prevIndex) {
      setPrevIndex(activeIndex);
    }
  }, [activeIndex, prevIndex]);

  const stretchFactor = isMoving ? 1 + Math.min(distance * 0.15, 0.35) : 1;
  const transformOrigin =
    direction === "down"
      ? "top center"
      : direction === "up"
        ? "bottom center"
        : "center center";

  return (
    <div className="flex h-screen w-full bg-surface-alt font-sans text-ink selection:bg-action selection:text-white lg:p-4">
      <aside className="hidden lg:flex w-20 bg-granate rounded-[30px] flex-col items-center py-6 justify-between z-30 overflow-visible relative">
        <div className="flex flex-col items-center overflow-visible">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-surface-alt text-granate shadow-md">
            <CosteARLogo className="h-6.5 w-auto text-granate" />
          </div>
        </div>

        <nav className="relative flex flex-col gap-4 w-full items-stretch overflow-visible">
          <div
            className="absolute left-0 right-0 h-12 pointer-events-none z-10 transition-all duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform: `translateY(${activeIndex * (48 + 16)}px) scaleY(${stretchFactor})`,
              transformOrigin,
              opacity: activeIndex === -1 ? 0 : 1,
            }}
          >
            <div
              className="absolute left-2.5 right-0 top-0 bottom-0 rounded-l-[20px]"
              style={{ backgroundColor: "var(--color-surface-alt)" }}
            />
            <div
              className="absolute left-20 right-[-16px] top-0 bottom-0"
              style={{ backgroundColor: "var(--color-surface-alt)" }}
            />
            <div
              className="absolute right-0 bottom-full w-4 h-4 pointer-events-none"
              style={{ backgroundColor: "var(--color-surface-alt)" }}
            />
            <div className="absolute right-0 bottom-full w-4 h-4 bg-granate rounded-br-[16px] pointer-events-none" />
            <div
              className="absolute right-0 top-full w-4 h-4 pointer-events-none"
              style={{ backgroundColor: "var(--color-surface-alt)" }}
            />
            <div className="absolute right-0 top-full w-4 h-4 bg-granate rounded-tr-[16px] pointer-events-none" />
          </div>

          {activeNavItems.map((navItem) => {
            const { to, icon: Icon } = navItem;
            const active = isNavActive(location.pathname, navItem);
            return (
              <div
                key={to}
                className="relative w-full h-12 flex items-center justify-center overflow-visible"
              >
                <Link
                  to={to}
                  viewTransition
                  className={cn(
                    "w-full h-12 relative flex items-center justify-center rounded-l-[24px] z-25 group transition-colors duration-150",
                    active ? "text-granate" : "text-white/70 hover:text-white",
                  )}
                >
                  {!active && (
                    <div className="absolute left-2.5 right-0 top-0 bottom-0 bg-transparent group-hover:bg-white/5 rounded-l-[20px] transition-colors duration-200 z-10 pointer-events-none" />
                  )}
                  <Icon className="size-[20px] shrink-0 z-20" />
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => logout.mutate()}
            className="flex size-12 items-center justify-center rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="size-[20px]" />
          </button>
        </div>
      </aside>

      <main className="flex w-full flex-col min-w-0 lg:pl-4">
        <div className="flex w-full flex-col h-full bg-surface-alt lg:bg-surface lg:rounded-[30px] lg:border border-line/40 overflow-hidden shadow-sm relative">
          <TopBar />
          <div className="flex-1 overflow-y-auto w-full relative">
            <div
              className={cn(
                "h-full px-4 py-6 md:px-8 md:py-8",
                wide ? "max-w-[1400px]" : "max-w-6xl",
                "mx-auto",
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile nav (not strictly needed for admin, but kept minimal) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-line/40 bg-white/90 pb-safe backdrop-blur-xl lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        {activeNavItems.map(({ to, label, icon: Icon }) => {
          const active = isNavActive(location.pathname, { to } as any);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full relative transition-colors",
                active ? "text-granate" : "text-ink-soft hover:text-ink",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-[22px] transition-transform",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={cn("text-[10px] font-semibold tracking-tight")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-line/40 pb-5">
      <div className="space-y-1">
        <h1 className="text-[26px] font-extrabold tracking-tight text-granate-deep">
          {title}
        </h1>
        {description && <p className="text-xs text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
