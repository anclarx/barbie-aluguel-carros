import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthPage, AuthSucesso } from "../components/layout/AuthPage";
import { Button } from "../components/ui/Button";
import { PasswordField } from "../components/ui/Field";
import { useToast } from "../hooks/useToast";
import { ROTULOS_CAMPOS } from "../lib/rotulosCampos";
import { authService } from "../services/authService";
import { ApiError, mensagemDeErro } from "../services/http";

/** Página aberta pelo link do e-mail de "esqueci a senha" (`/redefinir-senha?token=...`). */
export function RedefinirSenha() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = useSearchParams()[0].get("token") ?? "";
  const [senha, setSenha] = useState({ nova: "", confirmacao: "" });
  const [erros, setErros] = useState<{ nova?: string; confirmacao?: string; link?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const novos = {
      nova: senha.nova.length < 8 ? "A senha precisa ter pelo menos 8 caracteres." : undefined,
      confirmacao: senha.confirmacao !== senha.nova ? "As senhas não são iguais." : undefined,
    };
    setErros(novos);
    if (novos.nova || novos.confirmacao) return toast.camposInvalidos(novos, undefined, ROTULOS_CAMPOS);
    setEnviando(true);
    try {
      await authService.redefinirSenha(token, senha.nova);
      setConcluido(true);
    } catch (falha) {
      // Link vencido ou já usado vem como erro do campo `token`.
      const doLink = falha instanceof ApiError ? falha.erros.token : undefined;
      setErros(doLink ? { link: doLink } : { nova: mensagemDeErro(falha) });
      toast.erro(doLink ? "Link inválido" : "Não foi possível salvar a senha", doLink ?? mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <AuthSucesso titulo="Senha alterada" descricao="Pronto! Agora é só entrar com o seu e-mail e a nova senha.">
        <Button size="lg" fullWidth onClick={() => navigate("/login")}>
          Entrar
        </Button>
      </AuthSucesso>
    );
  }

  const linkInvalido = !token || erros.link;

  return (
    <AuthPage
      titulo="Crie uma nova senha"
      descricao="Escolha uma senha com pelo menos 8 caracteres."
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
      {linkInvalido ? (
        <div className="flex flex-col gap-16">
          <p className="rounded-md bg-status-danger-bg px-12 py-8 text-label-medium text-status-danger-text">
            {erros.link ?? "Este link de redefinição está incompleto."}
          </p>
          <Button size="lg" fullWidth onClick={() => navigate("/esqueci-senha")}>
            Pedir um novo link
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-16">
            <PasswordField
              label="Nova senha"
              placeholder="Sua nova senha"
              autoComplete="new-password"
              value={senha.nova}
              error={erros.nova}
              onChange={(e) => setSenha((s) => ({ ...s, nova: e.target.value }))}
            />
            <PasswordField
              label="Confirme a nova senha"
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              value={senha.confirmacao}
              error={erros.confirmacao}
              onChange={(e) => setSenha((s) => ({ ...s, confirmacao: e.target.value }))}
            />
          </div>
          <Button type="submit" size="lg" fullWidth disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </>
      )}
    </AuthPage>
  );
}
