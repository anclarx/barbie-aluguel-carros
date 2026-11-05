import { useCallback, useEffect, useRef, useState } from "react";

type Resultado<T> = { chave: string; dados?: T; erro?: unknown };

export type Async<T> = {
  dados: T | undefined;
  erro: unknown;
  carregando: boolean;
  /** Busca de novo mantendo os dados atuais na tela até a resposta chegar. */
  recarregar: () => void;
};

/**
 * Carrega dados assíncronos e refaz a busca quando `chave` muda (ex.: o id do local ou a página).
 * Respostas que chegam depois de uma troca de chave são descartadas.
 */
export function useAsync<T>(carregar: () => Promise<T>, chave: string): Async<T> {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const [versao, setVersao] = useState(0);
  const carregarAtual = useRef(carregar);

  useEffect(() => {
    carregarAtual.current = carregar;
  });

  const chaveAtual = `${chave}#${versao}`;

  useEffect(() => {
    let ativo = true;
    carregarAtual.current().then(
      (dados) => ativo && setResultado({ chave: chaveAtual, dados }),
      (erro: unknown) => ativo && setResultado((anterior) => ({ chave: chaveAtual, dados: anterior?.dados, erro })),
    );
    return () => {
      ativo = false;
    };
  }, [chaveAtual]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return {
    dados: resultado?.dados,
    erro: resultado?.chave === chaveAtual ? resultado.erro : undefined,
    carregando: resultado?.chave !== chaveAtual,
    recarregar,
  };
}
