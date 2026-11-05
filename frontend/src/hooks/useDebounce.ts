import { useEffect, useState } from "react";

/** Devolve `valor` só depois de `ms` sem mudanças: evita uma requisição a cada tecla. */
export function useDebounce<T>(valor: T, ms = 200) {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return atrasado;
}
