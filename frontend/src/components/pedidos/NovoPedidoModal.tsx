import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { modelos } from "../../data/mock";
import { diasEntre } from "../../lib/format";
import type { Modelo } from "../../types";
import { CarOption } from "../carros/CarCard";
import { CarResumoCard } from "../carros/CarSpecs";
import { Button } from "../ui/Button";
import { Checkbox, DateField } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { ResumoPedido } from "./ResumoPedido";

type Props = {
  open: boolean;
  /** Modelo já escolhido (ex.: "Alugar" na vitrine) abre direto na etapa 2. */
  modeloInicial?: Modelo | null;
  onClose: () => void;
  onDetalhes: (modelo: Modelo) => void;
  onCriado: () => void;
};

/** Modal "Novo pedido" em 2 etapas (US03). */
export function NovoPedidoModal({ open, modeloInicial, onClose, onDetalhes, onCriado }: Props) {
  if (!open) return null;
  return (
    <Conteudo
      key={modeloInicial?.id ?? "novo"}
      modeloInicial={modeloInicial ?? null}
      onClose={onClose}
      onDetalhes={onDetalhes}
      onCriado={onCriado}
    />
  );
}

function Conteudo({ modeloInicial, onClose, onDetalhes, onCriado }: Omit<Props, "open"> & { modeloInicial: Modelo | null }) {
  const { automovelLivre, criarPedido } = useApp();
  const [etapa, setEtapa] = useState<1 | 2>(modeloInicial ? 2 : 1);
  const [modelo, setModelo] = useState<Modelo | null>(modeloInicial);
  const [dataRetirada, setDataRetirada] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [comCredito, setComCredito] = useState(false);
  const [erro, setErro] = useState("");

  const automovel = modelo ? automovelLivre(modelo.id) : undefined;

  const enviar = () => {
    if (!modelo) return;
    if (!dataRetirada || !dataEntrega) return setErro("Informe as datas de retirada e entrega.");
    if (diasEntre(dataRetirada, dataEntrega) < 1) return setErro("A entrega precisa ser depois da retirada.");
    if (!automovel) return setErro("Não há automóvel livre deste modelo no momento.");
    criarPedido({ modelo, dataRetirada, dataEntrega, comCredito });
    onCriado();
  };

  if (etapa === 1) {
    return (
      <Modal
        open
        onClose={onClose}
        context="Novo pedido · Etapa 1 de 2"
        title="Escolha o automóvel"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={!modelo} onClick={() => setEtapa(2)}>
              Continuar
            </Button>
          </>
        }
      >
        <div role="radiogroup" aria-label="Automóveis" className="grid grid-cols-4 gap-12">
          {modelos.map((m) => (
            <CarOption
              key={m.id}
              modelo={m}
              selecionado={modelo?.id === m.id}
              onSelect={() => setModelo(m)}
              onDetalhes={() => onDetalhes(m)}
            />
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      context="Novo pedido · Etapa 2 de 2"
      title="Período e confirmação"
      footer={
        <>
          <Button variant="secondary" onClick={() => setEtapa(1)}>
            Voltar
          </Button>
          <Button onClick={enviar}>Enviar pedido para análise</Button>
        </>
      }
    >
      {modelo && (
        <div className="grid grid-cols-2 gap-24">
          <div className="flex flex-col gap-24">
            <section className="flex flex-col gap-8">
              <h3 className="text-body-medium">Modelo do automóvel escolhido</h3>
              <CarResumoCard modelo={modelo} />
            </section>
            <section className="flex flex-col gap-8">
              <h3 className="text-body-medium">Detalhes do automóvel reservado</h3>
              <div className="flex flex-col rounded-lg border border-neutral-border p-16">
                <span className="text-label-medium text-neutral-secondary">Placa</span>
                <span className="text-body-medium">{automovel?.placa ?? "Sem automóvel disponível"}</span>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-24">
            <section className="flex flex-col gap-8">
              <h3 className="text-body-medium">Período e forma de liquidação</h3>
              <div className="grid grid-cols-2 gap-12">
                <DateField label="Data de retirada" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} />
                <DateField
                  label="Data de entrega"
                  value={dataEntrega}
                  min={dataRetirada || undefined}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
              </div>
              <span className="text-body-medium text-neutral-secondary">Contrato com crédito bancário</span>
              <Checkbox checked={comCredito} onChange={(e) => setComCredito(e.target.checked)}>
                <span className="text-body-medium">Associe o aluguel a um financiamento. O banco analisa seus rendimentos.</span>
              </Checkbox>
              {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
            </section>
            <section className="flex flex-col gap-8">
              <h3 className="text-body-medium">Resumo do pedido de aluguel</h3>
              <ResumoPedido
                modelo={modelo}
                diaria={modelo.diaria}
                dataRetirada={dataRetirada}
                dataEntrega={dataEntrega}
                comCredito={comCredito}
              />
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}
