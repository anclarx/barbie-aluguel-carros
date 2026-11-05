import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthLayout, RequireAuth, SemAgente, SiteLayout } from "./components/layout/Layouts";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import { Cadastro } from "./pages/Cadastro";
import { EsqueciSenha } from "./pages/EsqueciSenha";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MeusPedidos } from "./pages/MeusPedidos";
import { PainelAgente } from "./pages/PainelAgente";
import { Perfil } from "./pages/Perfil";
import { RedefinirSenha } from "./pages/RedefinirSenha";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route element={<SemAgente />}>
                <Route index element={<Home />} />
              </Route>
              <Route element={<RequireAuth para="cliente" />}>
                <Route path="alugueis" element={<MeusPedidos />} />
                <Route path="pedidos" element={<Navigate to="/alugueis" replace />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
              <Route element={<RequireAuth para="agente" />}>
                <Route path="agente" element={<PainelAgente />} />
              </Route>
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="cadastro" element={<Cadastro />} />
              <Route path="esqueci-senha" element={<EsqueciSenha />} />
              <Route path="redefinir-senha" element={<RedefinirSenha />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
