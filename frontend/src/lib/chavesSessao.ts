/** Chaves do sessionStorage que guardam a busca da Início enquanto a pessoa navega pelo site. */
export const CHAVES_SESSAO = {
  /** O que está preenchido no card de busca, mesmo antes de pesquisar. */
  camposBusca: "pinkgo.busca.campos",
  /** A última busca confirmada com "Pesquisar". */
  busca: "pinkgo.busca",
  filtroVitrine: "pinkgo.vitrine.filtro",
  paginaVitrine: "pinkgo.vitrine.pagina",
  /** Pedido começado por quem ainda não entrou: reaberto na Início depois do login. */
  pedidoPendente: "pinkgo.pedido.pendente",
} as const;
