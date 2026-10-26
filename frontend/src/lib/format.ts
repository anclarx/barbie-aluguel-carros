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
