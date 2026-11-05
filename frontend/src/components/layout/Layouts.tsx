import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { Footer } from "./Footer";
import { Header } from "./Header";

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

export function RequireAuth({ para }: { para: "cliente" | "agente" }) {
  const { cliente, agente } = useAuth();
  const location = useLocation();
  if (!cliente && !agente) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (para === "cliente" && !cliente) return <Navigate to="/agente" replace />;
  if (para === "agente" && !agente) return <Navigate to="/alugueis" replace />;
  return <Outlet />;
}

export function SemAgente() {
  const { agente } = useAuth();
  return agente ? <Navigate to="/agente" replace /> : <Outlet />;
}
