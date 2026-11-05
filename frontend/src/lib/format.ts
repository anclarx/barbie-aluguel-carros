const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(valor: number) {
  return moeda.format(valor).replace(/\s/g, "");
}

export function formatData(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diasEntre(inicio: string, fim: string) {
  if (!inicio || !fim) return 0;
  const ms = new Date(fim).getTime() - new Date(inicio).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function somarDias(iso: string, dias: number) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return isoLocal(new Date(ano, mes - 1, dia + dias));
}

export function primeiraRetirada() {
  const hoje = new Date();
  return isoLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1));
}

export const primeiraDevolucao = (retirada: string) => somarDias(retirada || primeiraRetirada(), 1);
