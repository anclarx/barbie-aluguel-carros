import { agenteService } from "../services/agenteService";
import type { FiltroPedidos } from "../services/pedidoService";
import { useAsync } from "./useAsync";

/** Pedidos que o agente logado recebe para analisar. */
export const usePedidosAgente = (filtro: FiltroPedidos) =>
  useAsync(
    () => agenteService.pedidos(filtro),
    `agente:pedidos:${filtro.status?.join(",") ?? ""}:${filtro.pagina}:${filtro.tamanho}`,
  );

/** Contagem por status para os cartões de situação do painel. */
export const useResumoAgente = () => useAsync(agenteService.resumo, "agente:resumo");
