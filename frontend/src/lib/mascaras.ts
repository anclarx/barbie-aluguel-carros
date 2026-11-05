/* Máscaras de digitação: aceitam o texto como vier (colado, com ou sem pontuação) e devolvem formatado. */

/** "52998224725" → "529.982.247-25" (formata enquanto digita). */
export function mascaraCpf(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/**
 * RG no formato mais comum, "12.345.678-9". O dígito final pode ser X.
 * Os estados usam formatos diferentes, então aceita de 5 a 9 caracteres e só pontua o que houver.
 */
export function mascaraRg(valor: string) {
  const limpo = valor.toUpperCase().replace(/[^\dX]/g, "");
  // X só vale como último caractere (dígito verificador).
  const d = limpo.replace(/X(?=.)/g, "").slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}-${d.slice(8)}`;
}

/**
 * Valor em reais digitado como numa maquininha: os dígitos entram pelos centavos.
 * "8" → 0,08 · "850000" → 8.500,00. Devolve o número; a tela mostra com `formatBRL`.
 */
export function valorDaMascaraMoeda(texto: string) {
  const centavos = Number(texto.replace(/\D/g, "").slice(0, 11) || "0");
  return centavos / 100;
}
