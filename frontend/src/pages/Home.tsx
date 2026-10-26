import { useState } from "react";
import { useNavigate } from "react-router";
import { CarCard } from "../components/carros/CarCard";
import { CarDetailsModal } from "../components/carros/CarDetailsModal";
import { Filtros } from "../components/carros/Filtros";
import { NovoPedidoModal } from "../components/pedidos/NovoPedidoModal";
import { Button } from "../components/ui/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { useApp } from "../context/AppContext";
import { modelos } from "../data/mock";
import { cn } from "../lib/cn";
import { aplicarFiltro, filtroVazio } from "../lib/filtro";
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
      "Sim. Enquanto o pedido estiver em análise financeira ou aprovado, você pode editar as datas e a forma de liquidação ou cancelá-lo em Meus pedidos. Um pedido aprovado que for alterado volta para análise.",
  },
  {
    pergunta: "Quais documentos preciso para alugar?",
    resposta: "CPF, RG e um comprovante de endereço. Os rendimentos informados no cadastro são usados na análise.",
  },
];

function Banner() {
  return (
    <section className="relative h-360 overflow-hidden">
      <img src="/images/banner.png" alt="" className="size-full object-cover" />
      {(["Anterior", "Próximo"] as const).map((rotulo, i) => (
        <button
          key={rotulo}
          type="button"
          aria-label={`${rotulo} banner`}
          className={cn(
            "absolute top-1/2 flex size-40 -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand-primary text-brand-primary",
            i === 0 ? "left-64" : "right-64",
          )}
        >
          <Icon name="seta" size={20} rotate={i === 0 ? 270 : 90} />
        </button>
      ))}
    </section>
  );
}

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

export function Home() {
  const { cliente } = useApp();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState(filtroVazio);
  const [detalhes, setDetalhes] = useState<Modelo | null>(null);
  const [alugar, setAlugar] = useState<Modelo | null>(null);

  const visiveis = aplicarFiltro(modelos, filtro);

  const iniciarAluguel = (modelo: Modelo) => {
    setDetalhes(null);
    // Visitante precisa entrar antes de alugar (roteiro de testes, passo 02).
    if (!cliente) return navigate("/login", { state: { from: "/" } });
    setAlugar(modelo);
  };

  return (
    <>
      <Banner />

      <section id="veiculos" className="mx-auto flex max-w-page flex-col gap-40 py-56">
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">Explore os veículos disponíveis para alugar</h1>
          <p className="text-body-medium">
            Filtre por marca, características ou preço diário e encontre o companheiro perfeito para a sua próxima viagem.
          </p>
        </div>
        <div className="flex gap-24">
          <Filtros modelos={modelos} valor={filtro} onChange={setFiltro} />
          {visiveis.length ? (
            <div className="grid flex-1 grid-cols-3 content-start gap-24">
              {visiveis.map((m) => (
                <CarCard key={m.id} modelo={m} onAlugar={() => iniciarAluguel(m)} onDetalhes={() => setDetalhes(m)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-16 rounded-lg border border-neutral-border bg-neutral-white p-40 text-center">
              <p className="text-body-bold">Nenhum veículo encontrado com esses filtros.</p>
              <Button variant="secondary" onClick={() => setFiltro(filtroVazio)}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      <section id="como-funciona" className="flex flex-col items-center gap-32 pt-56">
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
          <Button onClick={() => document.getElementById("veiculos")?.scrollIntoView({ behavior: "smooth" })}>
            Explorar coleção
          </Button>
        </div>
      </section>

      <Faq />

      <CarDetailsModal modelo={detalhes} onClose={() => setDetalhes(null)} onAlugar={iniciarAluguel} />
      <NovoPedidoModal
        open={!!alugar}
        modeloInicial={alugar}
        onClose={() => setAlugar(null)}
        onDetalhes={setDetalhes}
        onCriado={() => {
          setAlugar(null);
          navigate("/pedidos");
        }}
      />
    </>
  );
}
