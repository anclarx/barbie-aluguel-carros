import { useModelos } from "../../hooks/useCatalogo";
import type { Periodo } from "../../services/catalogoService";
import { useSessionState } from "../../hooks/useSessionState";
import { CHAVES_SESSAO } from "../../lib/chavesSessao";
import { aplicarFiltro, filtroVazio, type FiltroState } from "../../lib/filtro";
import { mensagemDeErro } from "../../services/http";
import type { Modelo } from "../../types";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Pagination } from "../ui/Pagination";
import { Spinner } from "../ui/Spinner";
import { CarCard } from "./CarCard";
import { Filtros } from "./Filtros";

/** Três linhas de três cartões. */
const CARROS_POR_PAGINA = 9;

type Props = {
  localId: number;
  /** Dias da busca: a vitrine só mostra modelos com automóvel livre nesse período. */
  periodo: Periodo;
  onAlugar: (modelo: Modelo) => void;
};

/**
 * "Explore os veículos disponíveis" depois da busca: carros com automóvel livre no local de retirada durante o período, filtros
 * laterais e paginação. Os filtros rodam no navegador sobre a lista que veio da API.
 */
export function Vitrine({ localId, periodo, onAlugar }: Props) {
  const { dados: modelos, erro, carregando, recarregar } = useModelos(localId, periodo);
  // Guardados na sessão: voltando para a Início, a vitrine continua com os mesmos filtros e página.
  const [filtro, setFiltro] = useSessionState(CHAVES_SESSAO.filtroVitrine, filtroVazio);
  const [pagina, setPagina] = useSessionState(CHAVES_SESSAO.paginaVitrine, 1);

  const filtrados = aplicarFiltro(modelos ?? [], filtro);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / CARROS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * CARROS_POR_PAGINA, paginaAtual * CARROS_POR_PAGINA);

  // Filtro novo começa da primeira página.
  const filtrar = (f: FiltroState) => {
    setFiltro(f);
    setPagina(1);
  };

  const mudarPagina = (n: number) => {
    setPagina(n);
    document.getElementById("veiculos")?.scrollIntoView({ behavior: "smooth" });
  };

  const conteudo = () => {
    if (erro && !modelos)
      return (
        <EmptyState
          className="flex-1"
          titulo="Não conseguimos carregar os veículos."
          descricao={mensagemDeErro(erro)}
          acao={
            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          }
        />
      );
    if (carregando && !modelos) return <Spinner rotulo="Buscando veículos…" className="flex-1" />;
    if (!modelos?.length)
      return (
        <EmptyState
          className="flex-1"
          titulo="Nenhum veículo livre neste local."
          descricao="Tente outro local de retirada."
        />
      );
    if (!filtrados.length)
      return (
        <EmptyState
          className="flex-1"
          titulo="Nenhum veículo encontrado com esses filtros."
          acao={
            <Button variant="secondary" icon={<Icon name="limpar" size={20} />} onClick={() => filtrar(filtroVazio)}>
              Limpar filtros
            </Button>
          }
        />
      );
    return (
      <div className="flex flex-1 flex-col items-center gap-40">
        <div className="grid w-full grid-cols-3 gap-24">
          {visiveis.map((m) => (
            <CarCard key={m.id} modelo={m} onAlugar={() => onAlugar(m)} />
          ))}
        </div>
        <Pagination pagina={paginaAtual} total={totalPaginas} onChange={mudarPagina} />
      </div>
    );
  };

  return (
    <section id="veiculos" className="mx-auto flex max-w-page scroll-mt-80 flex-col gap-24 pt-56 pb-80">
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-bold">Explore os veículos disponíveis para alugar</h1>
        <p className="text-body-medium">
          Filtre por marca, características ou preço diário e encontre o companheiro perfeito para a sua próxima viagem.
        </p>
      </div>
      <div className="flex items-start gap-24">
        {modelos?.length ? <Filtros modelos={modelos} valor={filtro} onChange={filtrar} /> : null}
        {conteudo()}
      </div>
    </section>
  );
}
