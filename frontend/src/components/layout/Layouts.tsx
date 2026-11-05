import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
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

/**
 * Login, cadastro e esqueci minha senha: só o cabeçalho e o formulário num card branco no centro da tela, sem
 * padrão de fundo e sem rodapé, para nada competir com o formulário.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="auth" />
      <main className="flex flex-1 items-center justify-center px-16 py-64">
        <div className="w-full max-w-auth rounded-xl border border-neutral-border bg-neutral-white p-48">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Bloqueia rotas autenticadas (US02): visitante vai para o login; quem está logado com o outro papel vai para a
 * área dele (agente não abre telas de cliente e vice-versa).
 */
export function RequireAuth({ para }: { para: "cliente" | "agente" }) {
  const { cliente, agente } = useAuth();
  const location = useLocation();
  if (!cliente && !agente) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (para === "cliente" && !cliente) return <Navigate to="/agente" replace />;
  if (para === "agente" && !agente) return <Navigate to="/alugueis" replace />;
  return <Outlet />;
}

/** A vitrine é do cliente e de quem visita: o agente logado vai direto para o painel dele. */
export function SemAgente() {
  const { agente } = useAuth();
  return agente ? <Navigate to="/agente" replace /> : <Outlet />;
}
