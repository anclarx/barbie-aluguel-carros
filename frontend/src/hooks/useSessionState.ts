import { useEffect, useState } from "react";

/*
 * useState que sobrevive à troca de página: o valor fica no sessionStorage da aba, então volta ao reabrir a
 * tela (e até depois de um refresh) e some quando a aba é fechada. Sem armazenamento disponível, vira um
 * useState comum.
 */

function ler<T>(chave: string, inicial: T): T {
  try {
    const bruto = sessionStorage.getItem(chave);
    return bruto === null ? inicial : (JSON.parse(bruto) as T);
  } catch {
    return inicial;
  }
}

export function useSessionState<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => ler(chave, inicial));

  useEffect(() => {
    try {
      sessionStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* armazenamento indisponível: o valor vale só enquanto a tela estiver aberta */
    }
  }, [chave, valor]);

  return [valor, setValor] as const;
}

/** Apaga valores guardados, para a próxima montagem começar do zero (ex.: filtros de uma busca anterior). */
export function esquecerSessionState(...chaves: string[]) {
  for (const chave of chaves) {
    try {
      sessionStorage.removeItem(chave);
    } catch {
      /* ignora */
    }
  }
}
