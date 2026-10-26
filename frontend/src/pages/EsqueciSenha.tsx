import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { Icon } from "../components/ui/Icon";

export function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro("Informe um e-mail válido.");
    setErro("");
    // TODO: chamar POST /api/auth/esqueci-senha quando o backend existir.
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-24 pt-136 text-center">
        <span className="flex size-114 items-center justify-center rounded-full bg-brand-primary text-neutral-white">
          <Icon name="check" size={72} />
        </span>
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Verifique seu e-mail</h1>
          <p className="text-body-medium">
            Se existir uma conta com <span className="text-body-bold">{email}</span>, enviamos um link para você criar uma nova
            senha.
          </p>
        </div>
        <Button className="w-182" onClick={() => navigate("/login")}>
          Voltar para o login
        </Button>
        <p className="text-body-medium">
          Não recebeu?{" "}
          <button type="button" onClick={() => setEnviado(false)} className="text-body-link text-brand-primary">
            Reenviar
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-40 pt-56">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-32">
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Esqueceu sua senha?</h1>
          <p className="text-body-medium">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
        </div>
        <TextField
          label="E-mail"
          type="email"
          placeholder="Seu e-mail"
          autoComplete="email"
          value={email}
          error={erro}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" size="lg" fullWidth>
          Enviar link
        </Button>
      </form>

      <p className="text-body-medium">
        Lembrou a senha?{" "}
        <Link to="/login" className="text-body-link text-brand-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
