import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BuscaAluguel, type Busca } from "../components/carros/BuscaAluguel";
import { Vitrine } from "../components/carros/Vitrine";
import { NovoPedidoModal } from "../components/pedidos/NovoPedidoModal";
import { Button } from "../components/ui/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { useAuth } from "../hooks/useAuth";
import type { ValoresPedido } from "../hooks/useFormularioPedido";
import { esquecerSessionState, useSessionState } from "../hooks/useSessionState";
import { useToast } from "../hooks/useToast";
import { CHAVES_SESSAO } from "../lib/chavesSessao";
import { esquecerPedidoPendente, lerPedidoPendente } from "../lib/pedidoPendente";
import type { Modelo } from "../types";

const passos: Array<{ titulo: string; texto: string; icon: IconName }> = [
  { titulo: "Escolha", texto: "Selecione o carro, o período e se o aluguel terá crédito bancário.", icon: "carro" },
  { titulo: "Análise financeira", texto: "Um agente avalia seus rendimentos e emite o parecer.", icon: "arquivos" },
  { titulo: "Contrato", texto: "Aprovado, o contrato é executado e a propriedade do veículo é registrada.", icon: "chave" },
];

const perguntas = [
  {
    pergunta: "Como funciona a análise financeira?",
    resposta:
      "Depois que você envia o pedido, um agente da PinkGo avalia seus rendimentos cadastrados. Se você escolheu crédito bancário, o banco parceiro também analisa a proposta antes do parecer final.",
  },
  {
    pergunta: "Posso alterar ou cancelar um pedido?",
    resposta:
      "Sim. Enquanto o pedido estiver em análise financeira ou aprovado, você pode editar as datas e a forma de liquidação ou cancelá-lo em Meus aluguéis. Um pedido aprovado que for alterado volta para análise.",
  },
  {
    pergunta: "Quais documentos preciso para alugar?",
    resposta: "CPF, RG e um comprovante de endereço. Os rendimentos informados no cadastro são usados na análise.",
  },
];

const irParaBusca = () => {
  const busca = document.getElementById("busca");
  busca?.scrollIntoView({ behavior: "smooth", block: "center" });
  busca?.querySelector("select")?.focus({ preventScroll: true });
};

function Faq() {
  const [aberta, setAberta] = useState(0);
  return (
    <section id="faq" className="mx-auto flex max-w-[1144px] flex-col items-center gap-40 px-16 py-80">
      <h2 className="text-heading-bold">Perguntas frequentes</h2>
      <ul className="w-full border-t border-neutral-border">
        {perguntas.map((item, i) => (
          <li key={item.pergunta} className="border-b border-neutral-border">
            <button
              type="button"
              aria-expanded={aberta === i}
              onClick={() => setAberta(aberta === i ? -1 : i)}
              className="flex w-full items-center justify-between px-16 py-32 text-left text-body-bold"
            >
              {item.pergunta}
              <Icon name="seta" size={24} rotate={aberta === i ? 0 : 180} className="text-brand-primary" />
            </button>
            {aberta === i && <p className="px-16 pb-32 text-body-medium">{item.resposta}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Apresentacao() {
  return (
    <>
      <section id="como-funciona" className="flex flex-col items-center gap-32 pt-80">
        <h2 className="flex items-center gap-8 text-heading-bold">
          Como funciona alugar um veículo na <span className="text-logo-header text-brand-primary">PinkGo</span>
        </h2>
        <div className="relative w-full">
          <div aria-hidden className="bg-padrao absolute inset-x-0 top-0 h-216" />
          <ol className="relative mx-auto grid max-w-page grid-cols-3 gap-32 px-80 pt-64">
            {passos.map((passo) => (
              <li
                key={passo.titulo}
                className="relative flex h-208 flex-col justify-center gap-24 overflow-hidden rounded-lg bg-brand-primary p-32 text-neutral-white"
              >
                <Icon name={passo.icon} size={144} className="absolute -top-16 -right-8 text-neutral-white opacity-15" />
                <h3 className="relative text-[24px] font-semibold">{passo.titulo}</h3>
                <p className="relative text-label-medium text-justify">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-page grid-cols-2 items-center gap-40 px-80 py-80">
        <img src="/images/feito-para-voce.png" alt="Conversível rosa estacionado" className="h-344 w-full rounded-lg object-cover" />
        <div className="flex flex-col items-start gap-24">
          <h2 className="text-heading-bold">
            Feito para acompanhar seu ritmo,
            <br />
            onde quer que você vá.
          </h2>
          <p className="text-body-medium text-justify">
            Do trajeto rápido no dia a dia até uma viagem longa no fim de semana, nossa curadoria traz o modelo ideal para
            cada momento. Design marcante, acabamento impecável e a liberdade de viver qualquer percurso com personalidade
            de sobra.
          </p>
          <Button onClick={irParaBusca}>Explorar coleção</Button>
        </div>
      </section>

      <Faq />
    </>
  );
}

export function Home() {
  const { cliente, agente } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [busca, setBusca] = useSessionState<Busca | null>(CHAVES_SESSAO.busca, null);
  const [alugar, setAlugar] = useState<{ modelo: Modelo; valores?: ValoresPedido } | null>(() =>
    cliente ? lerPedidoPendente() : null,
  );
  const acabouDePesquisar = useRef(false);

  useEffect(() => {
    if (!busca || !acabouDePesquisar.current) return;
    acabouDePesquisar.current = false;
    document.getElementById("veiculos")?.scrollIntoView({ behavior: "smooth" });
  }, [busca]);

  const trocarBusca = (nova: Busca | null) => {
    esquecerSessionState(CHAVES_SESSAO.filtroVitrine, CHAVES_SESSAO.paginaVitrine);
    acabouDePesquisar.current = nova !== null;
    setBusca(nova);
  };

  const iniciarAluguel = (modelo: Modelo) => {
    if (agente) return navigate("/agente");
    setAlugar({ modelo });
  };

  return (
    <>
      <section aria-label="Busca de veículos">
        <img src="/images/banner.png" alt="" className="h-338 w-full object-cover object-[50%_30%]" />
        <div className="px-64">
          <BuscaAluguel onPesquisar={trocarBusca} onLimpar={() => trocarBusca(null)} />
        </div>
      </section>

      {busca ? (
        <Vitrine
          key={`${busca.localRetiradaId}:${busca.dataRetirada}:${busca.dataDevolucao}`}
          localId={busca.localRetiradaId}
          periodo={{ retirada: busca.dataRetirada, entrega: busca.dataDevolucao }}
          onAlugar={iniciarAluguel}
        />
      ) : (
        <Apresentacao />
      )}

      <NovoPedidoModal
        modelo={alugar?.modelo ?? null}
        busca={busca}
        inicial={alugar?.valores}
        onClose={() => {
          esquecerPedidoPendente();
          setAlugar(null);
        }}
        onCriado={(pedido) => {
          esquecerPedidoPendente();
          setAlugar(null);
          toast.sucesso("Pedido enviado", `O pedido #${pedido.codigo} do ${pedido.modelo.nome} já está em análise financeira.`);
          navigate("/alugueis");
        }}
      />
    </>
  );
}
