import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { EnderecoAutocomplete } from "../components/cliente/EnderecoAutocomplete";
import { RendimentosEditor } from "../components/cliente/RendimentosEditor";
import { Button } from "../components/ui/Button";
import { PasswordField, TextField } from "../components/ui/Field";
import { Icon, type IconName } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { useResumoPedidos } from "../hooks/usePedidos";
import { useToast } from "../hooks/useToast";
import { ROTULOS_CAMPOS } from "../lib/rotulosCampos";
import { mascaraCpf, mascaraRg } from "../lib/mascaras";
import { clienteService } from "../services/clienteService";
import { ApiError, mensagemDeErro } from "../services/http";
import type { Cliente } from "../types";

function Bloco({ titulo, icon, children }: { titulo: string; icon: IconName; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-24 rounded-lg border border-neutral-border bg-neutral-white p-24">
      <h2 className="flex items-center gap-8 text-body-bold">
        <Icon name={icon} size={24} className="text-brand-primary" />
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** O servidor guarda CPF e RG só com dígitos; na tela eles aparecem com máscara. */
const formatar = (c: Cliente): Cliente => ({ ...c, cpf: mascaraCpf(c.cpf), rg: mascaraRg(c.rg) });

/** "Meu perfil" > "Editar dados cadastrais" (US07). */
export function Perfil() {
  const { cliente, atualizarCliente, sair } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cliente>(() => formatar(cliente!));
  const [senha, setSenha] = useState({ atual: "", nova: "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const temContratoAtivo = (useResumoPedidos().dados?.porStatus.CONTRATO_EM_EXECUCAO ?? 0) > 0;

  const campo = (nome: "nome" | "cpf" | "rg" | "endereco" | "profissao" | "email") => ({
    value: form[nome],
    error: erros[nome],
    onChange: (e: { target: { value: string } }) => {
      const mascara = nome === "cpf" ? mascaraCpf : nome === "rg" ? mascaraRg : null;
      setForm((f) => ({ ...f, [nome]: mascara ? mascara(e.target.value) : e.target.value }));
    },
  });

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { nome, cpf, rg, endereco, profissao, email, rendimentos } = form;
      const atualizado = await clienteService.atualizar({
        nome,
        cpf,
        rg,
        endereco,
        profissao,
        email,
        rendimentos,
        ...(senha.nova && { senhaAtual: senha.atual, novaSenha: senha.nova }),
      });
      atualizarCliente(atualizado);
      setForm(formatar(atualizado));
      setSenha({ atual: "", nova: "" });
      setErros({});
      toast.sucesso("Dados atualizados", "Suas alterações foram salvas.");
    } catch (erro) {
      const novos = erro instanceof ApiError && Object.keys(erro.erros).length ? erro.erros : { geral: mensagemDeErro(erro) };
      setErros(novos);
      toast.camposInvalidos(novos, "Não foi possível salvar", ROTULOS_CAMPOS);
    } finally {
      setEnviando(false);
    }
  };

  const confirmarExclusao = async () => {
    try {
      await clienteService.excluir();
      sair();
      toast.info("Conta excluída", "Seus dados foram apagados da PinkGo.", "usuario");
      navigate("/");
    } catch (erro) {
      setErroExclusao(mensagemDeErro(erro));
      toast.erro("Não foi possível excluir a conta", mensagemDeErro(erro));
    }
  };

  return (
    <form onSubmit={salvar} className="mx-auto flex max-w-[864px] flex-col gap-24 py-48">
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-bold">Editar dados cadastrais</h1>
        <p className="text-body-medium">Mantenha seus dados e rendimentos atualizados para agilizar a análise dos pedidos.</p>
      </div>

      <Bloco titulo="Acesso" icon="cadeado">
        <TextField label="E-mail" type="email" autoComplete="email" {...campo("email")} />
        <div className="grid grid-cols-2 gap-12">
          <PasswordField
            label="Senha atual"
            placeholder="Sua senha atual"
            autoComplete="current-password"
            value={senha.atual}
            error={erros.senhaAtual}
            onChange={(e) => setSenha((s) => ({ ...s, atual: e.target.value }))}
          />
          <PasswordField
            label="Nova senha"
            placeholder="Nova senha"
            autoComplete="new-password"
            value={senha.nova}
            error={erros.novaSenha}
            onChange={(e) => setSenha((s) => ({ ...s, nova: e.target.value }))}
          />
        </div>
      </Bloco>

      <Bloco titulo="Dados pessoais" icon="livroEnderecos">
        <TextField label="Nome completo" {...campo("nome")} />
        <div className="grid grid-cols-2 gap-12">
          <TextField label="CPF" inputMode="numeric" {...campo("cpf")} />
          <TextField label="RG" {...campo("rg")} />
        </div>
        <EnderecoAutocomplete
          valor={form.endereco}
          error={erros.endereco}
          onChange={(endereco) => setForm((f) => ({ ...f, endereco }))}
        />
      </Bloco>

      <Bloco titulo="Profissão e rendimentos" icon="cofrinho">
        <TextField label="Profissão" {...campo("profissao")} />
        <RendimentosEditor
          rendimentos={form.rendimentos}
          onChange={(rendimentos) => setForm((f) => ({ ...f, rendimentos }))}
        />
        {erros.rendimentos && <p className="text-label-medium text-status-danger-text">{erros.rendimentos}</p>}
      </Bloco>

      <div className="flex items-center justify-between">
        <Button variant="danger" onClick={() => setExcluir(true)}>
          Excluir conta
        </Button>
        <div className="flex items-center gap-12">
          {erros.geral && <span className="text-label-medium text-status-danger-text">{erros.geral}</span>}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </div>

      <Modal
        open={excluir}
        onClose={() => setExcluir(false)}
        width="sm"
        context="Meu perfil"
        title="Excluir conta"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExcluir(false)}>
              Voltar
            </Button>
            {!temContratoAtivo && <Button onClick={confirmarExclusao}>Sim, excluir conta</Button>}
          </>
        }
      >
        <p className="py-4 text-body-medium">
          {temContratoAtivo
            ? "Você tem um contrato em execução. A conta só pode ser excluída depois que ele for encerrado."
            : "Ao excluir sua conta, seus dados e pedidos deixam de ficar disponíveis. Essa ação não pode ser desfeita."}
        </p>
        {erroExclusao && <p className="text-label-medium text-status-danger-text">{erroExclusao}</p>}
      </Modal>
    </form>
  );
}
