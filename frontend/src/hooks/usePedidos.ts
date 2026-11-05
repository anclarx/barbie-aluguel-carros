import { pedidoService, type FiltroPedidos } from "../services/pedidoService";
import { useAsync } from "./useAsync";

export const usePedidos = (filtro: FiltroPedidos) =>
  useAsync(() => pedidoService.listar(filtro), `pedidos:${filtro.status?.join(",") ?? ""}:${filtro.pagina}:${filtro.tamanho}`);

/** Contagem por status para os cartões de situação de "Meus aluguéis". */
export const useResumoPedidos = () => useAsync(pedidoService.resumo, "pedidos:resumo");
