import { tokenAtual } from "./sessao";

/** Em dev o Vite encaminha /api para o Spring (vite.config.ts). Em produção, VITE_API_URL aponta para a API. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/** Erro da API no formato ProblemDetail; `erros` traz a mensagem de cada campo do formulário. */
export class ApiError extends Error {
  readonly status: number;
  readonly erros: Record<string, string>;

  constructor(status: number, mensagem: string, erros: Record<string, string> = {}) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.erros = erros;
  }
}

/** Mensagem para mostrar ao usuário, seja erro da API ou de rede. */
export const mensagemDeErro = (erro: unknown) =>
  erro instanceof ApiError ? erro.message : "Não foi possível falar com o servidor. Tente de novo.";

let aoExpirarSessao: (() => void) | null = null;

/** O AuthProvider registra aqui o que fazer quando o token vence (401 numa rota autenticada). */
export function definirAoExpirarSessao(callback: (() => void) | null) {
  aoExpirarSessao = callback;
}

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

async function requisicao<T>(metodo: Metodo, caminho: string, corpo?: unknown): Promise<T> {
  const token = tokenAtual();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (corpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}/api${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ApiError(0, "Não foi possível falar com o servidor. Tente de novo.");
  }

  if (resposta.status === 401 && token) aoExpirarSessao?.();
  if (!resposta.ok) {
    const problema = (await resposta.json().catch(() => ({}))) as { detail?: string; erros?: Record<string, string> };
    throw new ApiError(resposta.status, problema.detail ?? "Algo deu errado. Tente de novo.", problema.erros);
  }
  // 202 e 204 vêm sem corpo; só converte quando há conteúdo.
  const corpoResposta = await resposta.text();
  return (corpoResposta ? JSON.parse(corpoResposta) : undefined) as T;
}

export const http = {
  get: <T>(caminho: string) => requisicao<T>("GET", caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>("POST", caminho, corpo ?? {}),
  put: <T>(caminho: string, corpo: unknown) => requisicao<T>("PUT", caminho, corpo),
  delete: (caminho: string) => requisicao<void>("DELETE", caminho),
};

/** Monta a query string ignorando valores vazios: `query({ pagina: 1, status: ["A", "B"] })`. */
export function query(params: Record<string, string | number | string[] | null | undefined>) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor === null || valor === undefined || valor === "") continue;
    for (const v of Array.isArray(valor) ? valor : [valor]) busca.append(chave, String(v));
  }
  const texto = busca.toString();
  return texto ? `?${texto}` : "";
}
