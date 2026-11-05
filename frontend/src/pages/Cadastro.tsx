import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EnderecoAutocomplete } from "../components/cliente/EnderecoAutocomplete";
import { RendimentosEditor } from "../components/cliente/RendimentosEditor";
import { AuthPage, AuthSucesso } from "../components/layout/AuthPage";
import { Button } from "../components/ui/Button";
import { Checkbox, PasswordField, TextField } from "../components/ui/Field";
import { Stepper, type Etapa } from "../components/ui/Stepper";
import { useToast } from "../hooks/useToast";
import { ROTULOS_CAMPOS } from "../lib/rotulosCampos";
import { mascaraCpf, mascaraRg } from "../lib/mascaras";
import { novoRendimento } from "../lib/rendimentos";
import { clienteService } from "../services/clienteService";
import { ApiError, mensagemDeErro } from "../services/http";
import type { Rendimento } from "../types";

const etapas: Etapa[] = [
  { label: "Acesso", icon: "cadeado" },
  { label: "Dados", icon: "livroEnderecos" },
  { label: "Renda", icon: "cofrinho" },
];

/** Campos formatados enquanto a pessoa digita. */
const mascaras: Partial<Record<string, (valor: string) => string>> = { cpf: mascaraCpf, rg: mascaraRg };

/** Campos de cada etapa, para abrir a etapa certa quando o servidor recusa um deles. */
const etapaDosCampos = [
  ["email", "senha"],
  ["nome", "cpf", "rg", "endereco"],
  ["profissao", "rendimentos"],
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

const textos = [
  { titulo: "Acesso à conta", descricao: "Com eles você acessa a PinkGo." },
  { titulo: "Dados pessoais", descricao: "Preencha como está no seu documento." },
  {
    titulo: "Profissão e rendimentos",
    descricao: "Informe sua profissão e de onde vem sua renda mensal. Você pode adicionar até 3 rendimentos.",
  },
];

export function Cadastro() {
  const navigate = useNavigate();
  const toast = useToast();
  const [etapa, setEtapa] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [dados, setDados] = useState({ email: "", senha: "", termos: true, nome: "", cpf: "", rg: "", endereco: "", profissao: "" });
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([novoRendimento()]);
  const [enviando, setEnviando] = useState(false);

  const campo = (nome: keyof typeof dados) => ({
    value: dados[nome] as string,
    error: erros[nome],
    onChange: (e: { target: { value: string } }) =>
      setDados((d) => ({ ...d, [nome]: mascaras[nome]?.(e.target.value) ?? e.target.value })),
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
      if (dados.rg.replace(/[^\dX]/g, "").length < 5) e.rg = "Informe seu RG.";
      if (!dados.endereco.trim()) e.endereco = "Informe seu endereço.";
    }
    if (etapa === 2) {
      if (!dados.profissao.trim()) e.profissao = "Informe sua profissão.";
      if (rendimentos.some((r) => !r.tipo || !r.valorMensal)) e.rendimentos = "Preencha o tipo e o valor de cada rendimento.";
    }
    setErros(e);
    toast.camposInvalidos(e, undefined, ROTULOS_CAMPOS);
    return !Object.keys(e).length;
  };

  const avancar = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;
    if (etapa < 2) {
      // E-mail (etapa 1), CPF e RG (etapa 2) não podem repetir: confere no servidor antes de avançar.
      setEnviando(true);
      try {
        await clienteService.verificar(etapa === 0 ? { email: dados.email } : { cpf: dados.cpf, rg: dados.rg });
        setEtapa(etapa + 1);
      } catch (erro) {
        // Sem campo na resposta (ex.: servidor fora do ar), a mensagem vai para o primeiro campo da etapa.
        const doServidor =
          erro instanceof ApiError && Object.keys(erro.erros).length
            ? erro.erros
            : { [etapa === 0 ? "email" : "cpf"]: mensagemDeErro(erro) };
        setErros(doServidor);
        toast.camposInvalidos(doServidor, undefined, ROTULOS_CAMPOS);
      } finally {
        setEnviando(false);
      }
      return;
    }

    const { email, senha, nome, cpf, rg, endereco, profissao } = dados;
    setEnviando(true);
    try {
      await clienteService.cadastrar({ email, senha, nome, cpf, rg, endereco, profissao, rendimentos });
      setConcluido(true);
    } catch (erro) {
      // Unicidade de e-mail, CPF e RG é validada no servidor: volta para a etapa do campo com erro.
      const doServidor = erro instanceof ApiError ? erro.erros : {};
      const etapaComErro = etapaDosCampos.findIndex((campos) => campos.some((c) => doServidor[c]));
      const novos = Object.keys(doServidor).length ? doServidor : { rendimentos: mensagemDeErro(erro) };
      setErros(novos);
      toast.camposInvalidos(novos, "Não foi possível criar a conta", ROTULOS_CAMPOS);
      if (etapaComErro >= 0) setEtapa(etapaComErro);
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <AuthSucesso
        titulo="Tudo pronto!"
        descricao="Seu cadastro foi realizado com sucesso. Agora é só entrar com seu e-mail e sua senha."
      >
        <Button size="lg" fullWidth onClick={() => navigate("/login")}>
          Entrar
        </Button>
      </AuthSucesso>
    );
  }

  const voltar = (
    <Button variant="secondary" size="lg" onClick={() => setEtapa(etapa - 1)}>
      Voltar
    </Button>
  );

  return (
    <AuthPage
      {...textos[etapa]}
      topo={<Stepper etapas={etapas} atual={etapa} layout="vertical" />}
      onSubmit={avancar}
      rodape={
        etapa === 0 && (
          <p className="text-body-medium">
            Já tem conta?{" "}
            <Link to="/login" className="text-body-link text-brand-primary transition-colors hover:text-brand-primary-hover">
              Entrar
            </Link>
          </p>
        )
      }
    >
      {etapa === 0 && (
        <>
          <div className="flex flex-col gap-16">
            <TextField label="E-mail" type="email" placeholder="Seu e-mail" autoComplete="email" {...campo("email")} />
            <PasswordField label="Senha" placeholder="Sua senha" autoComplete="new-password" {...campo("senha")} />
            <div className="flex flex-col gap-4">
              <Checkbox checked={dados.termos} onChange={(e) => setDados((d) => ({ ...d, termos: e.target.checked }))}>
                <span className="text-label-medium">
                  Li e concordo com os <a href="#" className="underline transition-colors hover:text-neutral-text">Termos de Uso</a> e a{" "}
                  <a href="#" className="underline transition-colors hover:text-neutral-text">Política de Privacidade</a>.
                </span>
              </Checkbox>
              {erros.termos && <span className="text-label-medium text-status-danger-text">{erros.termos}</span>}
            </div>
          </div>
          <Button type="submit" size="lg" fullWidth disabled={enviando}>
            {enviando ? "Conferindo…" : "Continuar"}
          </Button>
        </>
      )}

      {etapa === 1 && (
        <>
          <div className="flex flex-col gap-16">
            <TextField label="Nome completo" placeholder="Seu nome completo" autoComplete="name" {...campo("nome")} />
            <div className="grid grid-cols-2 gap-12">
              <TextField label="CPF" placeholder="000.000.000-00" inputMode="numeric" {...campo("cpf")} />
              <TextField label="RG" placeholder="00.000.000-0" {...campo("rg")} />
            </div>
            <EnderecoAutocomplete
              valor={dados.endereco}
              error={erros.endereco}
              onChange={(endereco) => setDados((d) => ({ ...d, endereco }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-12">
            {voltar}
            <Button type="submit" size="lg" disabled={enviando}>
              {enviando ? "Conferindo…" : "Continuar"}
            </Button>
          </div>
        </>
      )}

      {etapa === 2 && (
        <>
          <div className="flex flex-col gap-16">
            <TextField label="Profissão" placeholder="Sua profissão" {...campo("profissao")} />
            <RendimentosEditor rendimentos={rendimentos} onChange={setRendimentos} />
            {erros.rendimentos && <p className="text-label-medium text-status-danger-text">{erros.rendimentos}</p>}
          </div>
          <div className="grid grid-cols-2 gap-12">
            {voltar}
            <Button type="submit" size="lg" disabled={enviando}>
              {enviando ? "Criando conta…" : "Criar conta"}
            </Button>
          </div>
        </>
      )}
    </AuthPage>
  );
}
