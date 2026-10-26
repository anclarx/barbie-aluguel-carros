import { Navigate, Outlet, useLocation } from "react-router";
import { useApp } from "../../context/AppContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Páginas com cabeçalho completo e rodapé. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Login e cadastro: metade esquerda com o padrão rosa, formulário à direita. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="auth" />
      <main className="grid flex-1 grid-cols-2">
        <div aria-hidden className="bg-padrao" />
        <div className="flex justify-center px-64 py-56">
          <div className="w-full max-w-form">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Bloqueia rotas autenticadas para visitantes (US02). */
export function RequireAuth() {
  const { cliente } = useApp();
  const location = useLocation();
  if (!cliente) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
