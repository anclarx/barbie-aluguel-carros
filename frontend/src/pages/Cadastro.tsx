import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { RendimentosEditor } from "../components/cliente/RendimentosEditor";
import { Button } from "../components/ui/Button";
import { Checkbox, PasswordField, TextField } from "../components/ui/Field";
import { Icon } from "../components/ui/Icon";
import { Stepper, type Etapa } from "../components/ui/Stepper";
import { novoRendimento } from "../lib/rendimentos";
import type { Rendimento } from "../types";

const etapas: Etapa[] = [
  { label: "Acesso", icon: "cadeado" },
  { label: "Dados", icon: "livroEnderecos" },
  { label: "Renda", icon: "cofrinho" },
];

const cpfValido = (cpf: string) => {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  const digito = (len: number) => {
    const soma = [...n.slice(0, len)].reduce((s, d, i) => s + Number(d) * (len + 1 - i), 0);
    return ((soma * 10) % 11) % 10;
  };
  return digito(9) === Number(n[9]) && digito(10) === Number(n[10]);
};

function Titulo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-bold">{titulo}</h1>
      <p className="text-body-medium text-justify">{texto}</p>
    </div>
  );
}

export function Cadastro() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [dados, setDados] = useState({ email: "", senha: "", termos: true, nome: "", cpf: "", rg: "", endereco: "", profissao: "" });
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([novoRendimento()]);

  const campo = (nome: keyof typeof dados) => ({
    value: dados[nome] as string,
    error: erros[nome],
    onChange: (e: { target: { value: string } }) => setDados((d) => ({ ...d, [nome]: e.target.value })),
  });

  const validar = () => {
    const e: Record<string, string> = {};
    if (etapa === 0) {
      if (!/^\S+@\S+\.\S+$/.test(dados.email)) e.email = "Informe um e-mail válido.";
      if (dados.senha.length < 8) e.senha = "A senha precisa ter pelo menos 8 caracteres.";
      if (!dados.termos) e.termos = "Aceite os termos para continuar.";
    }
    if (etapa === 1) {
      if (!dados.nome.trim()) e.nome = "Informe seu nome completo.";
      if (!cpfValido(dados.cpf)) e.cpf = "CPF inválido.";
      if (!dados.rg.trim()) e.rg = "Informe seu RG.";
      if (!dados.endereco.trim()) e.endereco = "Informe seu endereço.";
    }
    if (etapa === 2) {
      if (!dados.profissao.trim()) e.profissao = "Informe sua profissão.";
      if (rendimentos.some((r) => !r.tipo || !r.valorMensal)) e.rendimentos = "Preencha o tipo e o valor de cada rendimento.";
    }
    setErros(e);
    return !Object.keys(e).length;
  };

  const avancar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;
    // TODO: enviar para POST /api/clientes quando o backend existir (unicidade de CPF e RG é validada lá).
    if (etapa < 2) setEtapa(etapa + 1);
    else setConcluido(true);
  };

  if (concluido) {
    return (
      <div className="flex flex-col items-center gap-24 pt-136 text-center">
        <span className="flex size-114 items-center justify-center rounded-full bg-brand-primary text-neutral-white">
          <Icon name="check" size={72} />
        </span>
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Tudo pronto!</h1>
          <p className="text-body-medium">Seu cadastro foi realizado com sucesso. Agora é só continuar para os próximos passos.</p>
        </div>
        <Button className="w-182" onClick={() => navigate("/login")}>
          Entrar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={avancar} noValidate className="flex flex-col gap-32 pt-8">
      <Stepper etapas={etapas} atual={etapa} layout="vertical" />

      {etapa === 0 && (
        <>
          <Titulo titulo="Acesso à conta" texto="Com eles você acessa a PinkGo." />
          <div className="flex flex-col gap-24">
            <TextField label="E-mail" type="email" placeholder="Seu e-mail" autoComplete="email" {...campo("email")} />
            <PasswordField label="Senha" placeholder="Sua senha" autoComplete="new-password" {...campo("senha")} />
          </div>
          <Button type="submit" size="lg" fullWidth>
            Continuar
          </Button>
          <p className="text-body-medium">
            Já tem conta?{" "}
            <Link to="/login" className="text-body-link text-brand-primary">
              Entrar
            </Link>
          </p>
          <div className="flex flex-col gap-4">
            <Checkbox checked={dados.termos} onChange={(e) => setDados((d) => ({ ...d, termos: e.target.checked }))}>
              <span className="text-body-medium">
                Li e concordo com os <a href="#" className="underline">Termos de Uso</a> e a{" "}
                <a href="#" className="underline">Política de Privacidade</a>.
              </span>
            </Checkbox>
            {erros.termos && <span className="text-label-medium text-status-danger-text">{erros.termos}</span>}
          </div>
        </>
      )}

      {etapa === 1 && (
        <>
          <Titulo titulo="Dados pessoais" texto="Preencha como está no seu documento." />
          <div className="flex flex-col gap-24">
            <TextField label="Nome completo" placeholder="Seu nome completo" autoComplete="name" {...campo("nome")} />
            <div className="grid grid-cols-2 gap-12">
              <TextField label="CPF" placeholder="Seu CPF" inputMode="numeric" {...campo("cpf")} />
              <TextField label="RG" placeholder="Seu RG" {...campo("rg")} />
            </div>
            <TextField label="Endereço" placeholder="Seu endereço completo" autoComplete="street-address" {...campo("endereco")} />
          </div>
          <div className="grid grid-cols-2 gap-12">
            <Button variant="secondary" size="lg" onClick={() => setEtapa(0)}>
              Voltar
            </Button>
            <Button type="submit" size="lg">
              Continuar
            </Button>
          </div>
        </>
      )}

      {etapa === 2 && (
        <>
          <Titulo
            titulo="Profissão e rendimentos"
            texto="Informe sua profissão e de onde vem sua renda mensal. Você pode adicionar até 3 rendimentos."
          />
          <TextField label="Profissão" placeholder="Sua profissão" {...campo("profissao")} />
          <RendimentosEditor rendimentos={rendimentos} onChange={setRendimentos} />
          {erros.rendimentos && <p className="-mt-16 text-label-medium text-status-danger-text">{erros.rendimentos}</p>}
          <div className="grid grid-cols-2 gap-12">
            <Button variant="secondary" size="lg" onClick={() => setEtapa(1)}>
              Voltar
            </Button>
            <Button type="submit" size="lg">
              Criar conta
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
