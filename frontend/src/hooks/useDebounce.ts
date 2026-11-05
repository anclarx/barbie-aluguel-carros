import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, ms = 200) {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return atrasado;
}
