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

export type TipoRendimentoOpcao = { value: TipoRendimento; label: string; campo: string | null };

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
  imagemUrl: string;
  fotos: string[];
  disponiveis: number | null;
};

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
  bancoAssociado: string | null;
  propostas: Proposta[];
  justificativaParecer: string | null;
  pendenciaParaAprovar: string | null;
};

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

export type Pagina<T> = { itens: T[]; pagina: number; tamanho: number; total: number; totalPaginas: number };

export type ResumoPedidos = { total: number; porStatus: Record<StatusPedido, number> };

export type EnderecoSugestao = {
  descricao: string;
  logradouro: string;
  numero: string | null;
  bairro: string | null;
  cidade: string;
  uf: string | null;
  cep: string | null;
};

export type Banco = {
  id: number;
  nome: string;
  jurosMensal: number;
  parcelasMaximas: number;
  entradaMinima: number;
  opcoesParcelas: number[];
};

export type StatusProposta = "EM_ANALISE" | "APROVADA" | "NEGADA";

export type Simulacao = {
  entrada: number;
  valorFinanciado: number;
  parcelas: number;
  valorParcela: number;
  totalJuros: number;
  totalComFinanciamento: number;
};

export type Proposta = {
  id: number;
  banco: Banco;
  parcelas: number;
  status: StatusProposta;
  simulacao: Simulacao;
  motivo: string | null;
  escolhida: boolean;
};

export type PedidoAgente = { pedido: Pedido; cliente: Cliente };

export type Papel = "CLIENTE" | "AGENTE_EMPRESA";

export type Agente = { id: number; nome: string; email: string };
