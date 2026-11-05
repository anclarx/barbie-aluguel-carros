import type { TipoContrato } from "../types";

/** Em nome de quem o automóvel fica durante o contrato; quem decide é o agente da PinkGo, na aprovação. */
export const TIPOS_CONTRATO: { valor: TipoContrato; rotulo: string; descricao: string }[] = [
  { valor: "PROPRIEDADE_CLIENTE", rotulo: "Propriedade do cliente", descricao: "O carro fica em nome do cliente." },
  { valor: "PROPRIEDADE_EMPRESA", rotulo: "Propriedade da empresa", descricao: "O carro continua em nome da PinkGo." },
  {
    valor: "PROPRIEDADE_BANCO",
    rotulo: "Propriedade do banco",
    descricao: "O banco que financiou fica com o carro até a quitação.",
  },
];

export const rotuloContrato = (tipo: TipoContrato) => TIPOS_CONTRATO.find((t) => t.valor === tipo)?.rotulo ?? tipo;
