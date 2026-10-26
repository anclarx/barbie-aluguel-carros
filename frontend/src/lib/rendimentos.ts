import type { Rendimento } from "../types";

export const MAX_RENDIMENTOS = 3;

export const novoRendimento = (): Rendimento => ({ id: Date.now(), tipo: "", entidadeEmpregadora: "", valorMensal: 0 });

export const rendaTotal = (rendimentos: Rendimento[]) => rendimentos.reduce((soma, r) => soma + (r.valorMensal || 0), 0);
