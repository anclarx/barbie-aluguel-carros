import { useEffect, useState } from "react";
import { AnalisePedidoModal } from "../components/agente/AnalisePedidoModal";
import { CartoesSituacao, Info } from "../components/pedidos/Situacoes";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Icon } from "../components/ui/Icon";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { usePedidosAgente, useResumoAgente } from "../hooks/useAgente";
import { aguardandoBancos, etapaCredito, propostaEscolhida } from "../lib/credito";
import { diasEntre, formatBRL, formatData } from "../lib/format";
import { rendaTotal } from "../lib/rendimentos";
import { statusDaSituacao, type Situacao } from "../lib/situacoes";
import { mensagemDeErro } from "../services/http";
import type { Pedido, PedidoAgente } from "../types";

const POR_PAGINA = 5;

const textosSituacao: Record<Situacao, string> = {
  todos: "Todos os pedidos recebidos.",
  analise: "Aguardando o parecer.",
  aprovados: "Prontos para o contrato.",
  execucao: "Carros com os clientes.",
  historico: "Encerrados, cancelados ou negados.",
};

/** Como está o crédito do pedido, em poucas palavras, para a coluna "Liquidação". */
function liquidacao(pedido: Pedido) {
  if (!pedido.comCredito) return "Sem crédito";
  const escolhida = propostaEscolhida(pedido);
  if (escolhida) return escolhida.banco.nome;
  if (pedido.status !== "EM_ANALISE_FINANCEIRA") return "Com crédito";
  return {
    "bancos-analisando": "Bancos analisando",
    "escolher-banco": "Cliente escolhendo",
    "nenhum-aprovou": "Nenhum banco aprovou",
  }[etapaCredito(pedido) as "bancos-analisando" | "escolher-banco" | "nenhum-aprovou"];
}

function ItemPedidoAgente({ item, onAnalisar }: { item: PedidoAgente; onAnalisar: () => void }) {
  const { pedido, cliente } = item;
  const { modelo } = pedido;
  const dias = diasEntre(pedido.dataRetirada, pedido.dataEntrega);
  const emAnalise = pedido.status === "EM_ANALISE_FINANCEIRA";
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
      <Info rotulo="Cliente" valor={cliente.nome} className="w-160" />
      <Info rotulo="Renda mensal" valor={formatBRL(rendaTotal(cliente.rendimentos))} className="w-120" />
      <Info rotulo="Liquidação" valor={liquidacao(pedido)} className="w-140" />
      <Info rotulo="Total" valor={formatBRL(pedido.totalEstimado)} />
      <div className="ml-auto">
        <Button variant={emAnalise ? "primary" : "secondary"} onClick={onAnalisar}>
          {emAnalise ? "Analisar" : "Ver análise"}
        </Button>
      </div>
    </li>
  );
}

/**
 * Painel do agente da PinkGo: a "Meus aluguéis" de quem recebe os pedidos. Ele analisa a renda de cada cliente, dá
 * o parecer (depois da resposta dos bancos e da escolha do cliente) e acompanha os contratos.
 */
export function PainelAgente() {
  const { agente } = useAuth();
  const [situacao, setSituacao] = useState<Situacao>("analise");
  const [pagina, setPagina] = useState(1);
  const [analisar, setAnalisar] = useState<PedidoAgente | null>(null);
  const resumo = useResumoAgente();
  const pedidos = usePedidosAgente({ status: statusDaSituacao(situacao), pagina, tamanho: POR_PAGINA });

  const visiveis = pedidos.dados?.itens ?? [];

  // Os bancos respondem sozinhos em uns 30 segundos: enquanto algum não respondeu, a lista se atualiza.
  const esperandoBancos = aguardandoBancos(visiveis.map((i) => i.pedido));
  const recarregarPedidos = pedidos.recarregar;
  useEffect(() => {
    if (!esperandoBancos) return;
    const id = setInterval(recarregarPedidos, 10_000);
    return () => clearInterval(id);
  }, [esperandoBancos, recarregarPedidos]);

  if (!agente) return null;

  // Depois de um parecer, a lista e as contagens mudam juntas.
  const recarregar = () => {
    pedidos.recarregar();
    resumo.recarregar();
  };

  return (
    <div className="mx-auto flex max-w-page flex-col gap-32 py-48">
      <div className="flex flex-col gap-4">
        <span className="flex items-center gap-8 text-label-medium text-neutral-secondary">
          <Icon name="seloVerificado" size={16} className="text-brand-primary" />
          Agente da PinkGo · Olá, {agente.nome}
        </span>
        <h1 className="text-heading-bold">Pedidos de aluguel</h1>
        <p className="text-body-medium">
          Analise a renda de cada cliente, emita o parecer e acompanhe os contratos. Os bancos respondem ao crédito
          sozinhos.
        </p>
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
            titulo="Não conseguimos carregar os pedidos."
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
            {visiveis.map((item) => (
              <ItemPedidoAgente key={item.pedido.id} item={item} onAnalisar={() => setAnalisar(item)} />
            ))}
          </ul>
        ) : (
          <EmptyState titulo="Nenhum pedido por aqui." descricao="Quando chegar um pedido nesta situação, ele aparece aqui." />
        )}
      </div>

      <div className="flex justify-center">
        <Pagination pagina={pedidos.dados?.pagina ?? pagina} total={pedidos.dados?.totalPaginas ?? 1} onChange={setPagina} />
      </div>

      <AnalisePedidoModal item={analisar} onClose={() => setAnalisar(null)} onAlterado={recarregar} />
    </div>
  );
}
