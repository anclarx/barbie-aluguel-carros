import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Checkbox, PasswordField, TextField } from "../components/ui/Field";
import { useApp } from "../context/AppContext";

export function Login() {
  const { entrar } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);
  const [erro, setErro] = useState("");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || !senha) return setErro("Informe um e-mail válido e sua senha.");
    entrar(email);
    navigate((location.state as { from?: string } | null)?.from ?? "/pedidos", { replace: true });
  };

  return (
    <div className="flex flex-col gap-40 pt-56">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-32">
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Acesse sua conta ou cadastre-se</h1>
          <p className="text-body-medium">Informe seu e-mail e sua senha para continuar.</p>
        </div>
        <div className="flex flex-col gap-16">
          <TextField label="E-mail" type="email" placeholder="Seu e-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex flex-col gap-12">
            <PasswordField label="Senha" placeholder="Sua senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <div className="flex items-center justify-between">
              <Checkbox checked={manter} onChange={(e) => setManter(e.target.checked)}>
                <span className="text-label-medium">Manter logado</span>
              </Checkbox>
              <Link to="/esqueci-senha" className="text-label-medium underline hover:text-brand-primary">
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
          {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
        </div>
        <Button type="submit" size="lg" fullWidth>
          Entrar
        </Button>
      </form>

      <p className="text-body-medium">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="text-body-link text-brand-primary">
          Cadastre-se
        </Link>
      </p>

      <p className="text-body-medium text-justify">
        Ao continuar, você concorda com nossos <a href="#" className="underline">Termos de Uso</a> e nossa{" "}
        <a href="#" className="underline">Política de Privacidade</a>.
      </p>
    </div>
  );
}
