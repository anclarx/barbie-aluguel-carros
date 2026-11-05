import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthPage } from "../components/layout/AuthPage";
import { Button } from "../components/ui/Button";
import { Checkbox, PasswordField, TextField } from "../components/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ROTULOS_CAMPOS } from "../lib/rotulosCampos";
import { lerPedidoPendente } from "../lib/pedidoPendente";
import { ApiError, mensagemDeErro } from "../services/http";

export function Login() {
  const { entrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const novos = {
      email: /^\S+@\S+\.\S+$/.test(email) ? undefined : "Informe um e-mail válido.",
      senha: senha ? undefined : "Informe sua senha.",
    };
    setErros(novos);
    if (novos.email || novos.senha) return toast.camposInvalidos(novos, undefined, ROTULOS_CAMPOS);
    setEnviando(true);
    try {
      const papel = await entrar(email, senha, manter);
      const voltarPara = (location.state as { from?: string } | null)?.from;
      const destino =
        papel !== "CLIENTE" ? "/agente" : (voltarPara ?? (lerPedidoPendente() ? "/" : "/alugueis"));
      navigate(destino, { replace: true });
    } catch (erro) {
      const doServidor = erro instanceof ApiError && erro.erros.email ? erro.erros : { senha: mensagemDeErro(erro) };
      setErros(doServidor);
      toast.camposInvalidos(doServidor, "Não foi possível entrar");
      setEnviando(false);
    }
  };

  return (
    <AuthPage
      titulo="Acesse sua conta ou cadastre-se"
      descricao="Informe seu e-mail e sua senha para continuar."
      onSubmit={enviar}
      rodape={
        <>
          <p className="text-body-medium">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="text-body-link text-brand-primary transition-colors hover:text-brand-primary-hover">
              Cadastre-se
            </Link>
          </p>
          <p className="text-label-medium text-neutral-secondary">
            Ao continuar, você concorda com nossos <a href="#" className="underline transition-colors hover:text-neutral-text">Termos de Uso</a> e nossa{" "}
            <a href="#" className="underline transition-colors hover:text-neutral-text">Política de Privacidade</a>.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-16">
        <TextField
          label="E-mail"
          type="email"
          placeholder="Seu e-mail"
          autoComplete="email"
          value={email}
          error={erros.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Senha"
          placeholder="Sua senha"
          autoComplete="current-password"
          value={senha}
          error={erros.senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <Checkbox checked={manter} onChange={(e) => setManter(e.target.checked)}>
            <span className="text-label-medium">Manter logado</span>
          </Checkbox>
          <Link to="/esqueci-senha" className="text-label-medium underline transition-colors hover:text-brand-primary">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
      <Button type="submit" size="lg" fullWidth disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </AuthPage>
  );
}
