import { useEffect, useState } from "react";
import { EditarPedidoModal } from "../components/pedidos/EditarPedidoModal";
import { EscolherFinanciamentoModal } from "../components/pedidos/EscolherFinanciamentoModal";
import { CancelarPedidoModal, DetalhesPedidoModal } from "../components/pedidos/PedidoModals";
import { CartoesSituacao, Info } from "../components/pedidos/Situacoes";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/Spinner";
import { usePedidos, useResumoPedidos } from "../hooks/usePedidos";
import { aguardandoBancos, etapaCredito, propostaEscolhida, type EtapaCredito } from "../lib/credito";
import { statusDaSituacao, type Situacao } from "../lib/situacoes";
import { mensagemDeErro } from "../services/http";
import { diasEntre, formatBRL, formatData } from "../lib/format";
import type { Pedido, StatusPedido } from "../types";

const POR_PAGINA = 5;

const textosSituacao: Record<Situacao, string> = {
  todos: "Tudo o que você já pediu na PinkGo.",
  analise: "Aguardando parecer do agente.",
  aprovados: "Parecer positivo emitido.",
  execucao: "Contratos ativos.",
  historico: "Encerrados, cancelados ou negados.",
};

const podeEditar = (s: StatusPedido) => s === "EM_ANALISE_FINANCEIRA" || s === "APROVADO";
// O design também mostra "Cancelar" em contrato em execução; regra a confirmar com o professor (guia, US06).
const podeCancelar = (s: StatusPedido) => podeEditar(s) || s === "CONTRATO_EM_EXECUCAO";

type Acoes = { onDetalhes: () => void; onEditar: () => void; onCancelar: () => void; onEscolher: () => void };

/** Recado do crédito na linha do pedido em análise: o que os bancos responderam e o que falta o cliente fazer. */
const recadoCredito: Partial<Record<EtapaCredito, { texto: string; destaque?: boolean }>> = {
  "bancos-analisando": { texto: "Os bancos estão analisando o crédito…" },
  "nenhum-aprovou": { texto: "Nenhum banco aprovou: siga sem financiamento ou cancele.", destaque: true },
  "banco-escolhido": { texto: "Aguardando o parecer da PinkGo." },
};

function ItemPedido({ pedido, onDetalhes, onEditar, onCancelar, onEscolher }: { pedido: Pedido } & Acoes) {
  const { modelo } = pedido;
  const dias = diasEntre(pedido.dataRetirada, pedido.dataEntrega);
  const etapa = etapaCredito(pedido);
  const emAnalise = pedido.status === "EM_ANALISE_FINANCEIRA";
  const recado = emAnalise ? recadoCredito[etapa] : undefined;
  // Bancos responderam: o cliente escolhe um deles ou segue sem financiamento.
  const precisaEscolher = emAnalise && (etapa === "escolher-banco" || etapa === "nenhum-aprovou");
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
        {recado && (
          <span className={recado.destaque ? "text-label-bold text-brand-primary" : "text-label-medium text-neutral-secondary"}>
            {recado.texto}
          </span>
        )}
      </div>
      <Info
        rotulo="Liquidação"
        valor={pedido.comCredito ? (propostaEscolhida(pedido)?.banco.nome ?? "Com crédito") : "Sem crédito"}
      />
      <Info rotulo="Diária" valor={formatBRL(modelo.diaria)} />
      <Info rotulo="Total" valor={formatBRL(pedido.totalEstimado)} />
      {/* Com financiamento para escolher, o botão fica em cima, na largura das outras ações (Figma, "Frame 52"). */}
      <div className="ml-auto flex flex-col gap-12">
        {precisaEscolher && (
          <Button variant="secondary" onClick={onEscolher}>
            Escolher financiamento
          </Button>
        )}
        <div className="flex items-center gap-12">
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
      </div>
    </li>
  );
}

export function MeusPedidos() {
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [pagina, setPagina] = useState(1);
  const [detalhes, setDetalhes] = useState<Pedido | null>(null);
  const [editar, setEditar] = useState<Pedido | null>(null);
  const [cancelar, setCancelar] = useState<Pedido | null>(null);
  const [escolher, setEscolher] = useState<Pedido | null>(null);

  const resumo = useResumoPedidos();
  const pedidos = usePedidos({ status: statusDaSituacao(situacao), pagina, tamanho: POR_PAGINA });

  // Depois de criar, editar ou cancelar, a lista e as contagens mudam juntas.
  const recarregar = () => {
    pedidos.recarregar();
    resumo.recarregar();
  };

  const visiveis = pedidos.dados?.itens ?? [];
  const totalPaginas = pedidos.dados?.totalPaginas ?? 1;

  // Os bancos respondem sozinhos em uns 30 segundos: enquanto algum não respondeu, a lista se atualiza.
  const esperandoBancos = aguardandoBancos(visiveis);
  const recarregarPedidos = pedidos.recarregar;
  useEffect(() => {
    if (!esperandoBancos) return;
    const id = setInterval(recarregarPedidos, 10_000);
    return () => clearInterval(id);
  }, [esperandoBancos, recarregarPedidos]);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-32 py-48">
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-bold">Meus aluguéis</h1>
        <p className="text-body-medium">Acompanhe cada etapa, modifique ou cancele enquanto o pedido permitir.</p>
      </div>

      <CartoesSituacao
        resumo={resumo.dados}
        textos={textosSituacao}
        ativa={situacao}
        onChange={(s) => {
          setSituacao(s);
          setPagina(1);
        }}
      />

      <div className="flex flex-col gap-16">
        <p className="text-body-medium">
          Itens por página: <span className="text-body-bold">{POR_PAGINA}</span>
        </p>
        {pedidos.erro && !pedidos.dados ? (
          <EmptyState
            titulo="Não conseguimos carregar seus pedidos."
            descricao={mensagemDeErro(pedidos.erro)}
            acao={
              <Button variant="secondary" onClick={recarregar}>
                Tentar de novo
              </Button>
            }
          />
        ) : !pedidos.dados ? (
          <Spinner rotulo="Carregando pedidos…" />
        ) : visiveis.length ? (
          <ul className="flex flex-col gap-16">
            {visiveis.map((p) => (
              <ItemPedido
                key={p.id}
                pedido={p}
                onDetalhes={() => setDetalhes(p)}
                onEditar={() => setEditar(p)}
                onCancelar={() => setCancelar(p)}
                onEscolher={() => setEscolher(p)}
              />
            ))}
          </ul>
        ) : (
          <EmptyState titulo="Nenhum pedido encontrado." />
        )}
      </div>

      <div className="flex justify-center">
        <Pagination pagina={pedidos.dados?.pagina ?? pagina} total={totalPaginas} onChange={setPagina} />
      </div>

      <DetalhesPedidoModal pedido={detalhes} onClose={() => setDetalhes(null)} />
      <EditarPedidoModal pedido={editar} onClose={() => setEditar(null)} onAlterado={recarregar} />
      <CancelarPedidoModal pedido={cancelar} onClose={() => setCancelar(null)} onAlterado={recarregar} />
      <EscolherFinanciamentoModal pedido={escolher} onClose={() => setEscolher(null)} onAlterado={recarregar} />
    </div>
  );
}
