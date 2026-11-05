import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "./Icon";

type Props<T> = {
  label: string;
  error?: string;
  icon: IconName;
  placeholder: string;
  /** Texto digitado; o componente pai guarda para buscar as sugestões. */
  texto: string;
  onTextoChange: (texto: string) => void;
  sugestoes: T[];
  carregando?: boolean;
  /** Mensagem quando a busca falhou; aparece no lugar das sugestões. */
  erroBusca?: string;
  /** Abaixo disso a lista nem abre (ex.: o endereço só busca a partir de 3 letras). */
  minimoCaracteres?: number;
  chave: (item: T) => string | number;
  renderSugestao: (item: T) => ReactNode;
  onSelecionar: (item: T) => void;
  vazio?: string;
  autoComplete?: string;
  /** Linha fixa no fim da lista, como a atribuição dos dados. */
  rodape?: ReactNode;
};

/**
 * Campo com sugestões enquanto a pessoa digita (padrão combobox da WAI-ARIA): setas navegam, Enter escolhe e Esc
 * fecha a lista.
 */
export function Autocomplete<T>({
  label,
  error,
  icon,
  placeholder,
  texto,
  onTextoChange,
  sugestoes,
  carregando,
  erroBusca,
  minimoCaracteres = 1,
  chave,
  renderSugestao,
  onSelecionar,
  vazio = "Nenhum resultado.",
  autoComplete = "off",
  rodape,
}: Props<T>) {
  const inputId = useId();
  const listaId = `${inputId}-lista`;
  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(0);
  const indice = Math.min(ativa, Math.max(sugestoes.length - 1, 0));

  const escolher = (item: T) => {
    onSelecionar(item);
    setAberta(false);
  };

  const teclado = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setAberta(true);
      const passo = e.key === "ArrowDown" ? 1 : -1;
      setAtiva((indice + passo + sugestoes.length) % Math.max(sugestoes.length, 1));
    } else if (e.key === "Enter" && aberta && sugestoes[indice]) {
      e.preventDefault();
      escolher(sugestoes[indice]);
    } else if (e.key === "Escape") {
      setAberta(false);
    }
  };

  const mostrarLista = aberta && texto.trim().length >= minimoCaracteres;

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <label htmlFor={inputId} className="text-body-medium text-neutral-secondary">
        {label}
      </label>
      <div className="relative">
        <div
          className={cn(
            // Mesma caixa do TextField, para combinar com os outros campos do formulário.
            "flex h-46 w-full items-center gap-8 rounded-md border border-neutral-border bg-neutral-white px-16 text-body-medium text-neutral-text focus-within:border-brand-primary",
            error && "border-status-danger-text",
          )}
        >
          <Icon name={icon} size={20} className="pointer-events-none shrink-0" />
          <input
            id={inputId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={mostrarLista}
            aria-controls={listaId}
            aria-activedescendant={mostrarLista && sugestoes[indice] ? `${listaId}-${indice}` : undefined}
            aria-invalid={!!error}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={texto}
            onChange={(e) => {
              onTextoChange(e.target.value);
              setAtiva(0);
              setAberta(true);
            }}
            onFocus={() => setAberta(true)}
            onBlur={() => setAberta(false)}
            onKeyDown={teclado}
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-secondary"
          />
          {texto && (
            <button
              type="button"
              aria-label={`Limpar ${label.toLowerCase()}`}
              onClick={() => onTextoChange("")}
              className="shrink-0 text-neutral-secondary hover:text-brand-primary"
            >
              <Icon name="fechar" size={16} />
            </button>
          )}
        </div>
        {mostrarLista && (
          <ul
            id={listaId}
            role="listbox"
            aria-label={label}
            // Evita o blur do input antes do clique na sugestão.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute inset-x-0 top-full z-20 mt-4 max-h-280 overflow-y-auto rounded-md border border-neutral-border bg-neutral-white py-4 shadow-dropdown"
          >
            {sugestoes.length ? (
              sugestoes.map((item, i) => (
                <li
                  key={chave(item)}
                  id={`${listaId}-${i}`}
                  role="option"
                  aria-selected={i === indice}
                  onMouseEnter={() => setAtiva(i)}
                  onClick={() => escolher(item)}
                  className={cn("flex cursor-pointer items-center gap-12 px-16 py-8", i === indice && "bg-brand-pink-soft")}
                >
                  <Icon name={icon} size={16} className="shrink-0 text-neutral-secondary" />
                  <div className="min-w-0">{renderSugestao(item)}</div>
                </li>
              ))
            ) : (
              <li className="px-16 py-8 text-label-medium text-neutral-secondary">
                {erroBusca ?? (carregando ? "Buscando…" : vazio)}
              </li>
            )}
            {rodape && (
              <li role="presentation" className="border-t border-neutral-border px-16 pt-8 pb-4 text-right text-caption-medium text-neutral-secondary">
                {rodape}
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <span className="text-label-medium text-status-danger-text">{error}</span>}
    </div>
  );
}
