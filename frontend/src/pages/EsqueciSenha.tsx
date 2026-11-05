import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthPage, AuthSucesso } from "../components/layout/AuthPage";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { useToast } from "../hooks/useToast";
import { ROTULOS_CAMPOS } from "../lib/rotulosCampos";
import { authService } from "../services/authService";
import { mensagemDeErro } from "../services/http";

export function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErro("Informe um e-mail válido.");
      return toast.camposInvalidos({ email: "Informe um e-mail válido." }, undefined, ROTULOS_CAMPOS);
    }
    setErro("");
    setEnviando(true);
    try {
      await authService.esqueciSenha(email);
      setEnviado(true);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      toast.erro("Não foi possível enviar o link", mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <AuthSucesso
        titulo="Verifique seu e-mail"
        descricao={
          <>
            Se existir uma conta com <span className="text-body-bold">{email}</span>, enviamos um link para você criar uma
            nova senha. Ele vale por 30 minutos.
          </>
        }
      >
        <Button size="lg" fullWidth onClick={() => navigate("/login")}>
          Voltar para o login
        </Button>
        <p className="text-body-medium">
          Não recebeu?{" "}
          <button
            type="button"
            disabled={enviando}
            onClick={async () => {
              setEnviando(true);
              try {
                await authService.esqueciSenha(email);
                toast.sucesso("Link reenviado", `Confira a caixa de entrada de ${email}.`);
              } catch (falha) {
                toast.erro("Não foi possível reenviar", mensagemDeErro(falha));
              } finally {
                setEnviando(false);
              }
            }}
            className="text-body-link text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            Reenviar
          </button>
        </p>
      </AuthSucesso>
    );
  }

  return (
    <AuthPage
      titulo="Esqueceu sua senha?"
      descricao="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      onSubmit={enviar}
      rodape={
        <p className="text-body-medium">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-body-link text-brand-primary transition-colors hover:text-brand-primary-hover">
            Entrar
          </Link>
        </p>
      }
    >
      <TextField
        label="E-mail"
        type="email"
        placeholder="Seu e-mail"
        autoComplete="email"
        value={email}
        error={erro}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" size="lg" fullWidth disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar link"}
      </Button>
    </AuthPage>
  );
}
