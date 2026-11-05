import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import { mensagemDeErro } from "../../services/http";
import { pedidoService } from "../../services/pedidoService";
import type { Pedido } from "../../types";
import { PropostaBadge, StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

type Props = { pedido: Pedido | null; onClose: () => void; onAlterado: () => void };

type Opcao = number | "sem";

export function EscolherFinanciamentoModal({ pedido, onClose, onAlterado }: Props) {
  if (!pedido) return null;
  return <Conteudo key={pedido.id} pedido={pedido} onClose={onClose} onAlterado={onAlterado} />;
}

function Conteudo({ pedido, onClose, onAlterado }: Props & { pedido: Pedido }) {
  const toast = useToast();
  const aprovadas = pedido.propostas.filter((p) => p.status === "APROVADA");
  const [opcao, setOpcao] = useState<Opcao | null>(aprovadas.length === 1 ? aprovadas[0].banco.id : null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    if (opcao === null) return toast.erro("Escolha uma opção", "Selecione um banco ou siga sem financiamento.");
    setEnviando(true);
    try {
      if (opcao === "sem") await pedidoService.desistirDoFinanciamento(pedido.id);
      else await pedidoService.escolherFinanciamento(pedido.id, opcao);
      toast.sucesso(
        opcao === "sem" ? "Seguindo sem financiamento" : "Financiamento escolhido",
        "Agora é só aguardar o parecer da PinkGo.",
      );
      onAlterado();
      onClose();
    } catch (e) {
      toast.erro("Não foi possível salvar a escolha", mensagemDeErro(e));
      setEnviando(false);
    }
  };

  const cartao = (selecionado: boolean, habilitado: boolean) =>
    cn(
      "flex w-full flex-col gap-8 rounded-lg border p-16 text-left transition-colors",
      selecionado ? "border-2 border-brand-primary bg-brand-pink-soft/40" : "border-neutral-border",
      habilitado ? "hover:border-brand-primary" : "cursor-not-allowed bg-page opacity-70",
    );

  return (
    <Modal
      open
      onClose={onClose}
      width="md"
      selo={<StatusBadge status={pedido.status} tamanho="md" />}
      context={`Pedido #${pedido.codigo}`}
      title="Escolha o financiamento"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando || opcao === null}>
            {enviando ? "Salvando…" : "Confirmar escolha"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-16">
        <p className="text-body-medium">
          {aprovadas.length
            ? "Os bancos responderam. Escolha qual vai financiar o seu aluguel ou siga sem financiamento."
            : "Nenhum banco aprovou o crédito. Para continuar, siga sem financiamento ou cancele o pedido."}
        </p>
        <div role="radiogroup" aria-label="Forma de pagamento" className="flex flex-col gap-12">
          {pedido.propostas.map((p) => {
            const aprovada = p.status === "APROVADA";
            const selecionado = opcao === p.banco.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selecionado}
                disabled={!aprovada}
                onClick={() => setOpcao(p.banco.id)}
                className={cartao(selecionado, aprovada)}
              >
                <span className="flex items-center justify-between gap-8">
                  <span className="text-body-bold">{p.banco.nome}</span>
                  <PropostaBadge status={p.status} />
                </span>
                {aprovada ? (
                  <span className="grid grid-cols-3 gap-8 text-label-medium">
                    <span className="flex flex-col">
                      <span className="text-neutral-secondary">Entrada</span>
                      {formatBRL(p.simulacao.entrada)}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-neutral-secondary">Parcelas</span>
                      {p.simulacao.parcelas}x de {formatBRL(p.simulacao.valorParcela)}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-neutral-secondary">Total com juros</span>
                      {formatBRL(p.simulacao.totalComFinanciamento)}
                    </span>
                  </span>
                ) : (
                  p.motivo && <span className="text-label-medium text-neutral-secondary">{p.motivo}</span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            role="radio"
            aria-checked={opcao === "sem"}
            onClick={() => setOpcao("sem")}
            className={cartao(opcao === "sem", true)}
          >
            <span className="text-body-bold">Seguir sem financiamento</span>
            <span className="text-label-medium text-neutral-secondary">
              Pagar o total de {formatBRL(pedido.totalEstimado)} sem crédito bancário.
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
