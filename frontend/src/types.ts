/* Tipos espelhando as entidades do guia (seção 3). */

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
  autonomia?: string;
  carroceria: string;
  cor: string;
  descricao: string;
  imagemUrl: string;
  fotos: string[];
};

export type Automovel = {
  id: number;
  matricula: string;
  placa: string;
  modeloId: number;
  disponivel: boolean;
};

export type Pedido = {
  id: number;
  codigo: string;
  modelo: Modelo;
  automovel: Automovel | null;
  dataSolicitacao: string;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  totalEstimado: number;
  status: StatusPedido;
  tipoContrato: TipoContrato;
  bancoAssociado?: string;
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
