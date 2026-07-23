import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';
import { AdminOverviewPage } from '@/features/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { AdminVaultPage } from '@/features/admin/AdminVaultPage';
import { AdminRagPage } from '@/features/admin/AdminRagPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <div>No encontrado</div>,
});

/** Guardia: restringe el acceso solo a administradores. */
function requireAdmin() {
  const { accessToken, initializing, user } = useAuthStore.getState();
  if (!accessToken && !initializing) {
    throw redirect({ to: '/login' });
  }
  if (user && user.role !== 'ADMIN') {
    // Si no es admin, no tiene permiso en este portal
    throw redirect({ to: '/login' });
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { accessToken, user } = useAuthStore.getState();
    if (accessToken) {
      if (user?.role === 'ADMIN') throw redirect({ to: '/admin' });
      // Redirige al login para que vea un error o pueda cambiar cuenta
      throw redirect({ to: '/login' });
    }
    throw redirect({ to: '/login' });
  },
});

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage });
const forgotRoute = createRoute({ getParentRoute: () => rootRoute, path: '/forgot-password', component: ForgotPasswordPage });
const resetRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reset-password', component: ResetPasswordPage });
const changePasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: '/change-password', component: ChangePasswordPage });

const adminOverviewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', beforeLoad: requireAdmin, component: AdminOverviewPage });
const adminUsersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/users', beforeLoad: requireAdmin, component: AdminUsersPage });
const adminVaultRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/vault', beforeLoad: requireAdmin, component: AdminVaultPage });
const adminRagRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/chat', beforeLoad: requireAdmin, component: AdminRagPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotRoute,
  resetRoute,
  changePasswordRoute,
  adminOverviewRoute,
  adminUsersRoute,
  adminVaultRoute,
  adminRagRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
