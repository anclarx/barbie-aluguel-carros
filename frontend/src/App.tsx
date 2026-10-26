import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthLayout, RequireAuth, SiteLayout } from "./components/layout/Layouts";
import { AppProvider } from "./context/AppContext";
import { Cadastro } from "./pages/Cadastro";
import { EsqueciSenha } from "./pages/EsqueciSenha";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MeusPedidos } from "./pages/MeusPedidos";
import { Perfil } from "./pages/Perfil";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route element={<RequireAuth />}>
              <Route path="pedidos" element={<MeusPedidos />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="cadastro" element={<Cadastro />} />
            <Route path="esqueci-senha" element={<EsqueciSenha />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
