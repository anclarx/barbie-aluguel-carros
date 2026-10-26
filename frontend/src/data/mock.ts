import type { Automovel, Cliente, Modelo, Pedido, TipoRendimento } from "../types";

/*
 * Dados de exemplo enquanto o backend não existe.
 * Seguem o seed do guia (seção 4) e as telas do Figma.
 */

const img = (arquivo: string) => `/images/carros/${arquivo}.png`;

const base = {
  cambio: "Câmbio automático",
  combustivel: "Flex",
  assentos: 4,
  portas: 2,
  seguro: "Incluso",
  portaMalas: "300 L",
  cor: "Rosa",
  fotos: [] as string[],
};

export const modelos: Modelo[] = [
  {
    ...base,
    id: 1,
    marca: "DreamMotors",
    nome: "Pegasus Cabrio",
    ano: 2024,
    diaria: 1000,
    combustivel: "Elétrico",
    assentos: 2,
    portaMalas: "240 L",
    autonomia: "450 km",
    carroceria: "Conversível",
    cor: "Branco perolado",
    descricao:
      "Um conversível feito para ser notado. O Pegasus Cabrio reúne design moderno, brilho perolado e a liberdade de rodar de teto aberto, com toda a tecnologia dos elétricos de nova geração.",
    imagemUrl: img("pegasus-cabrio"),
    fotos: [img("pegasus-cabrio-grande"), img("pegasus-cabrio-2"), img("pegasus-cabrio-3"), img("pegasus-cabrio-4")],
  },
  {
    ...base,
    id: 2,
    marca: "Malibu Auto",
    nome: "Sunset GT",
    ano: 2023,
    diaria: 560,
    assentos: 2,
    carroceria: "Conversível",
    cor: "Pink",
    descricao: "Esportivo conversível para curtir o pôr do sol na orla com estilo.",
    imagemUrl: img("sunset-gt"),
  },
  {
    ...base,
    id: 3,
    marca: "Malibu Auto",
    nome: "Lilac Spyder",
    ano: 2021,
    diaria: 270,
    assentos: 2,
    carroceria: "Esportivo",
    cor: "Lilás",
    descricao: "Um spyder lilás compacto e ágil, perfeito para a cidade.",
    imagemUrl: img("lilac-spyder"),
  },
  {
    ...base,
    id: 4,
    marca: "Malibu Auto",
    nome: "Coast 4x4",
    ano: 2022,
    diaria: 420,
    cambio: "Câmbio manual",
    portas: 2,
    carroceria: "SUV",
    cor: "Azul-claro",
    descricao: "Tração 4x4 para trilhas, praias e qualquer aventura de fim de semana.",
    imagemUrl: img("coast-4x4"),
  },
  {
    ...base,
    id: 5,
    marca: "Malibu Auto",
    nome: "Speedster Z",
    ano: 2024,
    diaria: 630,
    combustivel: "Híbrido",
    assentos: 2,
    carroceria: "Conversível",
    cor: "Pink",
    descricao: "Roadster híbrido com acabamento pink e muita personalidade.",
    imagemUrl: img("speedster-z"),
  },
  {
    ...base,
    id: 6,
    marca: "Heritage Pink",
    nome: "Sweet 57",
    ano: 1957,
    diaria: 2300,
    cambio: "Câmbio manual",
    assentos: 2,
    carroceria: "Clássico",
    cor: "Rosa-bebê",
    descricao: "Um clássico de 1957 restaurado, para eventos e ensaios inesquecíveis.",
    imagemUrl: img("sweet-57"),
  },
  {
    ...base,
    id: 7,
    marca: "Heritage Pink",
    nome: "Bel-Star Cruiser",
    ano: 1959,
    diaria: 1500,
    cambio: "Câmbio manual",
    assentos: 5,
    carroceria: "Clássico",
    cor: "Azul-turquesa",
    descricao: "Conversível clássico com cromados e espaço para toda a turma.",
    imagemUrl: img("bel-star-cruiser"),
  },
  {
    ...base,
    id: 8,
    marca: "Malibu Auto",
    nome: "Expedition Glam",
    ano: 2012,
    diaria: 350,
    assentos: 7,
    portas: 4,
    portaMalas: "500 L",
    carroceria: "SUV",
    descricao: "SUV rosa espaçoso para viagens longas com a família ou as amigas.",
    imagemUrl: img("expedition-glam"),
  },
  {
    ...base,
    id: 9,
    marca: "DreamMotors",
    nome: "Baby Beetle",
    ano: 2008,
    diaria: 180,
    cambio: "Câmbio manual",
    portas: 2,
    carroceria: "Hatch",
    cor: "Azul-bebê",
    descricao: "Compacto, charmoso e econômico para o dia a dia.",
    imagemUrl: img("baby-beetle"),
  },
].map((m) => ({ ...m, fotos: m.fotos.length ? m.fotos : [m.imagemUrl] }));

export const automoveis: Automovel[] = [
  { id: 1, matricula: "MAT-1001", placa: "PNK-7G09", modeloId: 1, disponivel: false },
  { id: 2, matricula: "MAT-1002", placa: "PNK-2S23", modeloId: 2, disponivel: false },
  { id: 3, matricula: "MAT-1003", placa: "PNK-3L21", modeloId: 3, disponivel: false },
  { id: 4, matricula: "MAT-1004", placa: "PNK-4C22", modeloId: 4, disponivel: false },
  { id: 5, matricula: "MAT-1005", placa: "PNK-5S24", modeloId: 5, disponivel: true },
  { id: 6, matricula: "MAT-1006", placa: "PNK-6W57", modeloId: 6, disponivel: true },
  { id: 7, matricula: "MAT-1007", placa: "PNK-7B59", modeloId: 7, disponivel: true },
  { id: 8, matricula: "MAT-1008", placa: "PNK-8E12", modeloId: 8, disponivel: true },
  { id: 9, matricula: "MAT-1009", placa: "PNK-9B08", modeloId: 9, disponivel: true },
  { id: 10, matricula: "MAT-1010", placa: "PNK-1P10", modeloId: 1, disponivel: true },
];

const modelo = (id: number) => modelos.find((m) => m.id === id)!;
const automovel = (id: number) => automoveis.find((a) => a.id === id)!;

export const pedidosIniciais: Pedido[] = [
  {
    id: 1327, codigo: "P1327", modelo: modelo(2), automovel: automovel(2), dataSolicitacao: "2026-10-05",
    dataRetirada: "2027-01-01", dataEntrega: "2027-01-21", comCredito: true, totalEstimado: 11200,
    status: "EM_ANALISE_FINANCEIRA", tipoContrato: "PROPRIEDADE_BANCO",
  },
  {
    id: 1331, codigo: "P1331", modelo: modelo(1), automovel: automovel(1), dataSolicitacao: "2026-10-02",
    dataRetirada: "2027-01-01", dataEntrega: "2027-01-21", comCredito: true, totalEstimado: 20000,
    status: "NEGADO", tipoContrato: "PROPRIEDADE_BANCO",
  },
  {
    id: 2709, codigo: "P2709", modelo: modelo(3), automovel: automovel(3), dataSolicitacao: "2026-10-02",
    dataRetirada: "2027-01-01", dataEntrega: "2027-01-21", comCredito: false, totalEstimado: 5400,
    status: "APROVADO", tipoContrato: "PROPRIEDADE_EMPRESA",
  },
  {
    id: 1205, codigo: "P1205", modelo: modelo(4), automovel: automovel(4), dataSolicitacao: "2026-05-09",
    dataRetirada: "2026-10-10", dataEntrega: "2026-10-13", comCredito: false, totalEstimado: 1260,
    status: "CONTRATO_EM_EXECUCAO", tipoContrato: "PROPRIEDADE_EMPRESA",
  },
  {
    id: 9572, codigo: "P9572", modelo: modelo(8), automovel: automovel(8), dataSolicitacao: "2026-05-09",
    dataRetirada: "2026-11-01", dataEntrega: "2026-11-21", comCredito: true, totalEstimado: 7000,
    status: "CANCELADO", tipoContrato: "PROPRIEDADE_BANCO",
  },
  {
    id: 1042, codigo: "P1042", modelo: modelo(6), automovel: automovel(6), dataSolicitacao: "2026-03-14",
    dataRetirada: "2026-04-01", dataEntrega: "2026-04-03", comCredito: false, totalEstimado: 4600,
    status: "CONTRATO_ENCERRADO", tipoContrato: "PROPRIEDADE_CLIENTE",
  },
];

export const clienteExemplo: Cliente = {
  id: 1,
  nome: "Taylor Swift",
  cpf: "123.456.789-09",
  rg: "MG-12.345.678",
  endereco: "Rua das Flores, 1989, Belo Horizonte - MG",
  profissao: "Cantora",
  email: "taylorswift13@gmail.com",
  rendimentos: [
    { id: 1, tipo: "AUTONOMO", entidadeEmpregadora: "Shows e turnês", valorMensal: 15000 },
    { id: 2, tipo: "INVESTIMENTO", entidadeEmpregadora: "Renda fixa", valorMensal: 3000 },
  ],
};

export const tiposRendimento: Array<{ value: TipoRendimento; label: string; campo?: string }> = [
  { value: "EMPREGO_CLT_PUBLICO", label: "Emprego formal (CLT / Servidor público)", campo: "Nome empresa" },
  { value: "PJ_MEI", label: "Pessoa jurídica (PJ / MEI)", campo: "Razão social" },
  { value: "AUTONOMO", label: "Autônomo / Profissional liberal", campo: "Área de atuação" },
  { value: "APOSENTADORIA", label: "Aposentadoria / Pensão" },
  { value: "ALUGUEL", label: "Renda de aluguel" },
  { value: "INVESTIMENTO", label: "Investimentos" },
  { value: "OUTRO", label: "Outro", campo: "Descrição" },
];
