/* Tipos espelhando os DTOs da API (backend/src/main/java/br/pucminas/pinkgo/dto). */

export type StatusPedido =
  | "EM_ANALISE_FINANCEIRA"
  | "APROVADO"
  | "CONTRATO_EM_EXECUCAO"
  | "NEGADO"
  | "CANCELADO"
  | "CONTRATO_ENCERRADO";

export type TipoContrato = "PROPRIEDADE_CLIENTE" | "PROPRIEDADE_EMPRESA" | "PROPRIEDADE_BANCO";

export type TipoRendimento =
  | "EMPREGO_CLT_PUBLICO"
  | "PJ_MEI"
  | "AUTONOMO"
  | "APOSENTADORIA"
  | "ALUGUEL"
  | "INVESTIMENTO"
  | "OUTRO";

/** Opção do select de rendimento; `campo` é o rótulo do campo extra, quando a categoria pede um. */
export type TipoRendimentoOpcao = { value: TipoRendimento; label: string; campo: string | null };

/** Loja da PinkGo para retirada e devolução. `descricao` vem pronta: "Belo Horizonte - MG · Savassi". */
export type Local = { id: number; bairro: string; cidade: string; uf: string; descricao: string };

export type Modelo = {
  id: number;
  marca: string;
  nome: string;
  ano: number;
  diaria: number;
  cambio: string;
  combustivel: string;
  assentos: number;
  portas: number;
  seguro: string;
  portaMalas: string;
  carroceria: string;
  /** URLs completas, servidas pela API (`/api/imagens/...`). */
  imagemUrl: string;
  fotos: string[];
  /** Automóveis do modelo livres no período buscado; `null` quando a busca não tem período. */
  disponiveis: number | null;
};

/** Automóvel reservado no pedido. A placa só existe aqui, nunca na vitrine. */
export type AutomovelReservado = { id: number; matricula: string; placa: string };

export type Pedido = {
  id: number;
  codigo: string;
  modelo: Modelo;
  automovel: AutomovelReservado | null;
  localRetirada: Local;
  localDevolucao: Local;
  dataSolicitacao: string;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  totalEstimado: number;
  status: StatusPedido;
  tipoContrato: TipoContrato;
  /** Banco que o cliente escolheu para financiar, entre os que aprovaram. */
  bancoAssociado: string | null;
  /** Bancos escolhidos para o crédito, com a resposta de cada um. */
  propostas: Proposta[];
  /** Por que o agente aprovou ou negou (opcional). */
  justificativaParecer: string | null;
  /** O que falta para o agente poder aprovar (bancos analisando, escolha do cliente); `null` quando está pronto. */
  pendenciaParaAprovar: string | null;
};

/** `id` local enquanto o rendimento não foi salvo; o servidor gera o definitivo. */
export type Rendimento = {
  id: number;
  tipo: TipoRendimento | "";
  entidadeEmpregadora: string;
  valorMensal: number;
};

export type Cliente = {
  id: number;
  nome: string;
  cpf: string;
  rg: string;
  endereco: string;
  profissao: string;
  email: string;
  rendimentos: Rendimento[];
};

/** Página da API: `pagina` começa em 1. */
export type Pagina<T> = { itens: T[]; pagina: number; tamanho: number; total: number; totalPaginas: number };

export type ResumoPedidos = { total: number; porStatus: Record<StatusPedido, number> };

/** Endereço sugerido no cadastro; `descricao` é o texto pronto para o campo. */
export type EnderecoSugestao = {
  descricao: string;
  logradouro: string;
  numero: string | null;
  bairro: string | null;
  cidade: string;
  uf: string | null;
  cep: string | null;
};

/** Banco parceiro. `jurosMensal` e `entradaMinima` em %; `opcoesParcelas` como [6, 12, 18]. */
export type Banco = {
  id: number;
  nome: string;
  jurosMensal: number;
  parcelasMaximas: number;
  entradaMinima: number;
  opcoesParcelas: number[];
};

export type StatusProposta = "EM_ANALISE" | "APROVADA" | "NEGADA";

/** Financiamento com parcelas fixas (tabela Price), calculado sobre o total do aluguel. */
export type Simulacao = {
  entrada: number;
  valorFinanciado: number;
  parcelas: number;
  valorParcela: number;
  totalJuros: number;
  totalComFinanciamento: number;
};

/** Pedido de crédito enviado a um banco. O banco responde sozinho; `motivo` explica a resposta. */
export type Proposta = {
  id: number;
  banco: Banco;
  parcelas: number;
  status: StatusProposta;
  simulacao: Simulacao;
  motivo: string | null;
  /** É o banco que o cliente escolheu para financiar. */
  escolhida: boolean;
};

/** Pedido no painel do agente: os dados do aluguel e o cliente, com os rendimentos usados na análise. */
export type PedidoAgente = { pedido: Pedido; cliente: Cliente };

/** Quem está logado; vem no login. */
export type Papel = "CLIENTE" | "AGENTE_EMPRESA";

/** Agente da PinkGo. Não se cadastra pelo site: vem da carga inicial. */
export type Agente = { id: number; nome: string; email: string };
