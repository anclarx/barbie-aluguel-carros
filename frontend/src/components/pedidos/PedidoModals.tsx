import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { diasEntre, formatBRL, formatData } from "../../lib/format";
import type { Pedido, TipoContrato } from "../../types";
import { TituloModelo } from "../carros/CarCard";
import { CarResumoCard } from "../carros/CarSpecs";
import { rotuloStatus } from "../../lib/status";
import { Button } from "../ui/Button";
import { Checkbox, DateField } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { AndamentoPedido, ResumoPedido } from "./ResumoPedido";

const rotuloContrato: Record<TipoContrato, string> = {
  PROPRIEDADE_CLIENTE: "Propriedade do cliente",
  PROPRIEDADE_EMPRESA: "Propriedade da empresa",
  PROPRIEDADE_BANCO: "Propriedade do banco",
};

const contexto = (p: Pedido) => `Pedido #${p.id} · ${rotuloStatus[p.status]}`;

type ModalPedidoProps = { pedido: Pedido | null; onClose: () => void };

/** Modal "Detalhes do pedido" (US04). */
export function DetalhesPedidoModal({ pedido, onClose }: ModalPedidoProps) {
  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      context={pedido ? contexto(pedido) : ""}
      title="Detalhes do pedido"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {pedido && (
        <div className="flex flex-col gap-16">
          {/* Pedido cancelado não tem mais andamento para acompanhar. */}
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
                    <span className="text-body-medium">{rotuloContrato[pedido.tipoContrato]}</span>
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

/** Modal "Editar pedido" (US05). */
export function EditarPedidoModal({ pedido, onClose }: ModalPedidoProps) {
  if (!pedido) return null;
  return <EditarConteudo key={pedido.id} pedido={pedido} onClose={onClose} />;
}

function EditarConteudo({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const { editarPedido } = useApp();
  const [dataRetirada, setDataRetirada] = useState(pedido.dataRetirada);
  const [dataEntrega, setDataEntrega] = useState(pedido.dataEntrega);
  const [comCredito, setComCredito] = useState(pedido.comCredito);
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (diasEntre(dataRetirada, dataEntrega) < 1) return setErro("A entrega precisa ser depois da retirada.");
    editarPedido(pedido.id, { dataRetirada, dataEntrega, comCredito });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="md"
      context={contexto(pedido)}
      title="Editar pedido"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar alterações</Button>
        </>
      }
    >
      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-8">
          <h3 className="text-body-medium">Período e forma de liquidação</h3>
          <div className="grid grid-cols-2 gap-12">
            <DateField label="Data de retirada" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} />
            <DateField label="Data de entrega" value={dataEntrega} min={dataRetirada} onChange={(e) => setDataEntrega(e.target.value)} />
          </div>
          <span className="text-body-medium text-neutral-secondary">Contrato com crédito bancário</span>
          <Checkbox checked={comCredito} onChange={(e) => setComCredito(e.target.checked)}>
            <span className="text-body-medium">Associe o aluguel a um financiamento. O banco analisa seus rendimentos.</span>
          </Checkbox>
          {pedido.status === "APROVADO" && (
            <p className="text-label-medium text-status-warning-text">
              Ao salvar, o pedido aprovado volta para análise financeira.
            </p>
          )}
          {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
        </section>
        <section className="flex flex-col gap-8">
          <h3 className="text-body-medium">Resumo atualizado</h3>
          <div className="grid grid-cols-[1fr_160px] gap-12">
            <ResumoPedido
              diaria={pedido.modelo.diaria}
              dataRetirada={dataRetirada}
              dataEntrega={dataEntrega}
              comCredito={comCredito}
            />
            <div className="flex flex-col justify-center gap-8 rounded-lg border border-neutral-border p-12">
              <img src={pedido.modelo.imagemUrl} alt={pedido.modelo.nome} className="h-90 w-full object-contain" />
              <TituloModelo modelo={pedido.modelo} />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

/** Modal "Cancelar pedido" (US06). */
export function CancelarPedidoModal({ pedido, onClose }: ModalPedidoProps) {
  const { cancelarPedido } = useApp();
  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      width="sm"
      context={pedido ? contexto(pedido) : ""}
      title="Cancelar pedido"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
          <Button
            onClick={() => {
              if (pedido) cancelarPedido(pedido.id);
              onClose();
            }}
          >
            Sim, cancelar pedido
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
            <div className="flex flex-col">
              <span className="text-label-medium text-neutral-secondary">Placa</span>
              <span className="text-body-medium">{pedido.automovel?.placa ?? "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-medium text-neutral-secondary">Diária</span>
              <span className="text-body-medium">{formatBRL(pedido.modelo.diaria)}</span>
            </div>
          </div>
          <p className="text-body-medium text-justify">
            Ao cancelar, o pedido sai da análise e não poderá ser retomado. Você pode fazer uma nova solicitação quando
            quiser.
          </p>
        </div>
      )}
    </Modal>
  );
}
