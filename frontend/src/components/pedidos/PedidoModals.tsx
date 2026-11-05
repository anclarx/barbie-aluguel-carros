import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { formatData } from "../../lib/format";
import { mensagemDeErro } from "../../services/http";
import { pedidoService } from "../../services/pedidoService";
import { rotuloContrato } from "../../lib/contrato";
import type { Pedido } from "../../types";
import { CarResumoCard, TituloModelo } from "../carros/CarSpecs";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { AndamentoPedido, ResumoPedido } from "./ResumoPedido";

const cabecalho = (p: Pedido) => ({
  selo: <StatusBadge status={p.status} tamanho="md" />,
  context: `Pedido #${p.codigo}`,
});

type ModalPedidoProps = { pedido: Pedido | null; onClose: () => void };

type ModalAcaoProps = ModalPedidoProps & { onAlterado: () => void };

export function DetalhesPedidoModal({ pedido, onClose }: ModalPedidoProps) {
  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      {...(pedido && cabecalho(pedido))}
      title="Detalhes do pedido"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {pedido && (
        <div className="flex flex-col gap-16">
          {pedido.status !== "CANCELADO" && (
            <section className="flex flex-col gap-12">
              <h3 className="text-body-medium">
                Andamento do pedido{" "}
                <span className="text-label-medium text-neutral-secondary">
                  · solicitado em {formatData(pedido.dataSolicitacao)}
                </span>
              </h3>
              <AndamentoPedido status={pedido.status} />
            </section>
          )}
          <div className="grid grid-cols-2 gap-24">
            <section className="flex flex-col gap-8">
              <h3 className="text-body-medium">Modelo do automóvel escolhido</h3>
              <CarResumoCard modelo={pedido.modelo} className="flex-1" />
            </section>
            <div className="flex flex-col gap-24">
              <section className="flex flex-col gap-8">
                <h3 className="text-body-medium">Detalhes do automóvel reservado</h3>
                <div className="flex gap-32 rounded-lg border border-neutral-border p-16">
                  <div className="flex flex-col">
                    <span className="text-label-medium text-neutral-secondary">Placa</span>
                    <span className="text-body-medium">{pedido.automovel?.placa ?? "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-medium text-neutral-secondary">Tipo de contrato</span>
                    <span className="text-body-medium">{rotuloContrato(pedido.tipoContrato)}</span>
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-8">
                <h3 className="text-body-medium">Resumo do pedido de aluguel</h3>
                <ResumoPedido
                  modelo={pedido.modelo}
                  diaria={pedido.modelo.diaria}
                  dataRetirada={pedido.dataRetirada}
                  dataEntrega={pedido.dataEntrega}
                  comCredito={pedido.comCredito}
                />
              </section>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function CancelarPedidoModal({ pedido, onClose, onAlterado }: ModalAcaoProps) {
  if (!pedido) return null;
  return <CancelarConteudo key={pedido.id} pedido={pedido} onClose={onClose} onAlterado={onAlterado} />;
}

function CancelarConteudo({ pedido, onClose, onAlterado }: ModalAcaoProps & { pedido: Pedido }) {
  const toast = useToast();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    setEnviando(true);
    try {
      await pedidoService.cancelar(pedido.id);
      onAlterado();
      onClose();
      toast.sucesso("Pedido cancelado", `O pedido #${pedido.codigo} do ${pedido.modelo.nome} foi cancelado.`);
    } catch (e) {
      setErro(mensagemDeErro(e));
      toast.erro("Não foi possível cancelar", mensagemDeErro(e));
      setEnviando(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="sm"
      {...cabecalho(pedido)}
      title="Cancelar pedido"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando}>
            {enviando ? "Cancelando…" : "Sim, cancelar pedido"}
          </Button>
        </>
      }
    >
      {pedido && (
        <div className="flex flex-col gap-16 py-4">
          <p className="text-body-bold">Tem certeza que deseja cancelar este pedido?</p>
          <div className="flex items-center gap-16 rounded-lg border border-neutral-border p-12">
            <img src={pedido.modelo.imagemUrl} alt="" className="h-60 w-90 object-contain" />
            <TituloModelo modelo={pedido.modelo} className="flex-1" />
          </div>
          <p className="text-body-medium text-justify">
            Ao cancelar, o pedido sai da análise e não poderá ser retomado. Você pode fazer uma nova solicitação quando
            quiser.
          </p>
          {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
        </div>
      )}
    </Modal>
  );
}
