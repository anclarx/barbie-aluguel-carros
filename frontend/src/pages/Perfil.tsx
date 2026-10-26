import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { RendimentosEditor } from "../components/cliente/RendimentosEditor";
import { Button } from "../components/ui/Button";
import { PasswordField, TextField } from "../components/ui/Field";
import { Icon, type IconName } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
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

/** "Meu perfil" > "Editar dados cadastrais" (US07). */
export function Perfil() {
  const { cliente, salvarCliente, pedidos, sair } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cliente>(cliente!);
  const [senha, setSenha] = useState({ atual: "", nova: "" });
  const [salvo, setSalvo] = useState(false);
  const [excluir, setExcluir] = useState(false);

  const temContratoAtivo = pedidos.some((p) => p.status === "CONTRATO_EM_EXECUCAO");

  const campo = (nome: "nome" | "cpf" | "rg" | "endereco" | "profissao" | "email") => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => {
      setSalvo(false);
      setForm((f) => ({ ...f, [nome]: e.target.value }));
    },
  });

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    salvarCliente(form);
    setSalvo(true);
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
            onChange={(e) => setSenha((s) => ({ ...s, atual: e.target.value }))}
          />
          <PasswordField
            label="Nova senha"
            placeholder="Nova senha"
            autoComplete="new-password"
            value={senha.nova}
            onChange={(e) => setSenha((s) => ({ ...s, nova: e.target.value }))}
          />
        </div>
      </Bloco>

      <Bloco titulo="Dados pessoais" icon="livroEnderecos">
        <TextField label="Nome completo" {...campo("nome")} />
        <div className="grid grid-cols-2 gap-12">
          <TextField label="CPF" {...campo("cpf")} />
          <TextField label="RG" {...campo("rg")} />
        </div>
        <TextField label="Endereço" {...campo("endereco")} />
      </Bloco>

      <Bloco titulo="Profissão e rendimentos" icon="cofrinho">
        <TextField label="Profissão" {...campo("profissao")} />
        <RendimentosEditor
          rendimentos={form.rendimentos}
          onChange={(rendimentos) => {
            setSalvo(false);
            setForm((f) => ({ ...f, rendimentos }));
          }}
        />
      </Bloco>

      <div className="flex items-center justify-between">
        <Button variant="danger" onClick={() => setExcluir(true)}>
          Excluir conta
        </Button>
        <div className="flex items-center gap-12">
          {salvo && <span className="text-label-medium text-status-success-text">Alterações salvas.</span>}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit">Salvar alterações</Button>
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
            {!temContratoAtivo && (
              <Button
                onClick={() => {
                  sair();
                  navigate("/");
                }}
              >
                Sim, excluir conta
              </Button>
            )}
          </>
        }
      >
        <p className="py-4 text-body-medium">
          {temContratoAtivo
            ? "Você tem um contrato em execução. A conta só pode ser excluída depois que ele for encerrado."
            : "Ao excluir sua conta, seus dados e pedidos deixam de ficar disponíveis. Essa ação não pode ser desfeita."}
        </p>
      </Modal>
    </form>
  );
}
