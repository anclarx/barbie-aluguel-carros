const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** R$1.000,00 (sem espaço, como no design). */
export function formatBRL(valor: number) {
  return moeda.format(valor).replace(/\s/g, "");
}

/** "2027-05-09" → "09/05/2027" */
export function formatData(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Diferença em dias entre duas datas ISO (entrega − retirada). */
export function diasEntre(inicio: string, fim: string) {
  if (!inicio || !fim) return 0;
  const ms = new Date(fim).getTime() - new Date(inicio).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Data no fuso local como ISO ("2027-01-13"). `toISOString` usa UTC e adiantaria o dia à noite. */
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** "2027-01-12" + 1 → "2027-01-13" */
export function somarDias(iso: string, dias: number) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return isoLocal(new Date(ano, mes - 1, dia + dias));
}

/** Primeiro dia aceito para retirada: amanhã. Quem entra no dia 12 retira a partir do dia 13. */
export function primeiraRetirada() {
  const hoje = new Date();
  return isoLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1));
}

/** A devolução é pelo menos um dia depois da retirada. */
export const primeiraDevolucao = (retirada: string) => somarDias(retirada || primeiraRetirada(), 1);
