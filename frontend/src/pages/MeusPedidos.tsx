import { useState } from "react";
import { CarDetailsModal } from "../components/carros/CarDetailsModal";
import { NovoPedidoModal } from "../components/pedidos/NovoPedidoModal";
import { CancelarPedidoModal, DetalhesPedidoModal, EditarPedidoModal } from "../components/pedidos/PedidoModals";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { Pagination } from "../components/ui/Pagination";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/cn";
import { diasEntre, formatBRL, formatData } from "../lib/format";
import type { Modelo, Pedido, StatusPedido } from "../types";

const POR_PAGINA = 5;

type Situacao = "todos" | "analise" | "aprovados" | "execucao" | "historico";

const situacoes: Array<{ id: Situacao; titulo: string; texto: string; icon: IconName; status?: StatusPedido[] }> = [
  { id: "todos", titulo: "Todos", texto: "Tudo o que você já pediu na PinkGo.", icon: "colecao" },
  { id: "analise", titulo: "Em análise", texto: "Aguardando parecer do agente.", icon: "arquivos", status: ["EM_ANALISE_FINANCEIRA"] },
  { id: "aprovados", titulo: "Aprovados", texto: "Parecer positivo emitido.", icon: "seloVerificado", status: ["APROVADO"] },
  { id: "execucao", titulo: "Em execução", texto: "Contratos ativos.", icon: "chave", status: ["CONTRATO_EM_EXECUCAO"] },
  {
    id: "historico",
    titulo: "Histórico",
    texto: "Encerrados, cancelados ou negados.",
    icon: "calendario",
    status: ["CONTRATO_ENCERRADO", "CANCELADO", "NEGADO"],
  },
];

const podeEditar = (s: StatusPedido) => s === "EM_ANALISE_FINANCEIRA" || s === "APROVADO";
// O design também mostra "Cancelar" em contrato em execução; regra a confirmar com o professor (guia, US06).
const podeCancelar = (s: StatusPedido) => podeEditar(s) || s === "CONTRATO_EM_EXECUCAO";

function CardSituacao({
  situacao,
  total,
  ativo,
  onClick,
}: {
  situacao: (typeof situacoes)[number];
  total: number;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "relative flex h-170 flex-col overflow-hidden rounded-lg border p-24 text-left",
        ativo ? "border-brand-primary bg-brand-primary text-neutral-white" : "border-neutral-border bg-neutral-white hover:border-brand-pink",
      )}
    >
      <Icon
        name={situacao.icon}
        size={144}
        className={cn("absolute -top-8 -right-16", ativo ? "text-neutral-white opacity-20" : "text-brand-primary opacity-10")}
      />
      <span className="relative text-body-bold">{situacao.titulo}</span>
      <span className="relative text-display-medium">{total}</span>
      <span className={cn("relative text-body-medium", ativo ? "text-brand-pink-soft" : "text-neutral-secondary")}>
        {situacao.texto}
      </span>
    </button>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex w-100 flex-col">
      <span className="text-label-medium text-neutral-secondary">{rotulo}</span>
      <span className="text-body-medium">{valor}</span>
    </div>
  );
}

type Acoes = { onDetalhes: () => void; onEditar: () => void; onCancelar: () => void };

function ItemPedido({ pedido, onDetalhes, onEditar, onCancelar }: { pedido: Pedido } & Acoes) {
  const { modelo } = pedido;
  const dias = diasEntre(pedido.dataRetirada, pedido.dataEntrega);
  return (
    <li className="flex items-center gap-24 rounded-lg border border-neutral-border bg-neutral-white px-24 py-16">
      <img src={modelo.imagemUrl} alt={modelo.nome} className="h-108 w-160 object-contain" />
      <div className="flex w-280 flex-col gap-12">
        <StatusBadge status={pedido.status} />
        <div className="flex flex-col">
          <span className="text-label-medium text-neutral-secondary">
            ID #{pedido.codigo} · solicitado em {formatData(pedido.dataSolicitacao)}
          </span>
          <span className="flex items-baseline gap-4">
            <span className="text-body-bold">{modelo.nome}</span>
            <span className="text-label-medium text-neutral-secondary">
              · {modelo.marca} {modelo.ano}
            </span>
          </span>
        </div>
        <span className="text-label-medium">
          {formatData(pedido.dataRetirada)} → {formatData(pedido.dataEntrega)} · {dias} dias
        </span>
      </div>
      <Info rotulo="Liquidação" valor={pedido.comCredito ? "Com crédito" : "Sem crédito"} />
      <Info rotulo="Diária" valor={formatBRL(modelo.diaria)} />
      <Info rotulo="Total" valor={formatBRL(pedido.totalEstimado)} />
      <div className="ml-auto flex items-center gap-12">
        <Button variant="secondary" onClick={onDetalhes}>
          Detalhes
        </Button>
        {podeEditar(pedido.status) && (
          <Button variant="secondary" onClick={onEditar}>
            Editar
          </Button>
        )}
        {podeCancelar(pedido.status) && (
          <Button variant="danger" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  );
}

export function MeusPedidos() {
  const { pedidos } = useApp();
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [pagina, setPagina] = useState(1);
  const [novo, setNovo] = useState(false);
  const [detalhesCarro, setDetalhesCarro] = useState<Modelo | null>(null);
  const [detalhes, setDetalhes] = useState<Pedido | null>(null);
  const [editar, setEditar] = useState<Pedido | null>(null);
  const [cancelar, setCancelar] = useState<Pedido | null>(null);

  const doFiltro = (id: Situacao) => {
    const status = situacoes.find((s) => s.id === id)?.status;
    return status ? pedidos.filter((p) => status.includes(p.status)) : pedidos;
  };

  const lista = doFiltro(situacao);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = lista.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-32 py-48">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Meus pedidos</h1>
          <p className="text-body-medium">Acompanhe cada etapa, modifique ou cancele enquanto o pedido permitir.</p>
        </div>
        <Button icon={<Icon name="adicao" size={20} />} onClick={() => setNovo(true)}>
          Novo pedido
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-16">
        {situacoes.map((s) => (
          <CardSituacao
            key={s.id}
            situacao={s}
            total={doFiltro(s.id).length}
            ativo={situacao === s.id}
            onClick={() => {
              setSituacao(s.id);
              setPagina(1);
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-16">
        <p className="text-body-medium">
          Itens por página: <span className="text-body-bold">{POR_PAGINA}</span>
        </p>
        {visiveis.length ? (
          <ul className="flex flex-col gap-16">
            {visiveis.map((p) => (
              <ItemPedido
                key={p.id}
                pedido={p}
                onDetalhes={() => setDetalhes(p)}
                onEditar={() => setEditar(p)}
                onCancelar={() => setCancelar(p)}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-neutral-border bg-neutral-white p-40 text-center text-body-medium text-neutral-secondary">
            Nenhum pedido nesta situação.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Pagination pagina={paginaAtual} total={totalPaginas} onChange={setPagina} />
      </div>

      <NovoPedidoModal
        open={novo}
        onClose={() => setNovo(false)}
        onDetalhes={setDetalhesCarro}
        onCriado={() => {
          setNovo(false);
          setSituacao("todos");
          setPagina(1);
        }}
      />
      <CarDetailsModal
        modelo={detalhesCarro}
        onClose={() => setDetalhesCarro(null)}
        onAlugar={() => setDetalhesCarro(null)}
      />
      <DetalhesPedidoModal pedido={detalhes} onClose={() => setDetalhes(null)} />
      <EditarPedidoModal pedido={editar} onClose={() => setEditar(null)} />
      <CancelarPedidoModal pedido={cancelar} onClose={() => setCancelar(null)} />
    </div>
  );
}
