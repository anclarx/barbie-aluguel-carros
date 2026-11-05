import { useEffect, useState } from "react";

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
    }
  }, [chave, valor]);

  return [valor, setValor] as const;
}

export function esquecerSessionState(...chaves: string[]) {
  for (const chave of chaves) {
    try {
      sessionStorage.removeItem(chave);
    } catch {
    }
  }
}
