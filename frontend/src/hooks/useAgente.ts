import { agenteService } from "../services/agenteService";
import type { FiltroPedidos } from "../services/pedidoService";
import { useAsync } from "./useAsync";

export const usePedidosAgente = (filtro: FiltroPedidos) =>
  useAsync(
    () => agenteService.pedidos(filtro),
    `agente:pedidos:${filtro.status?.join(",") ?? ""}:${filtro.pagina}:${filtro.tamanho}`,
  );

export const useResumoAgente = () => useAsync(agenteService.resumo, "agente:resumo");
