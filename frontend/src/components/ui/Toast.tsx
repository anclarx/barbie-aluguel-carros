import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DadosToast, TipoToast } from "../../context/toastContext";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "./Icon";

const estilos: Record<TipoToast, { selo: string; barra: string; icone: IconName }> = {
  sucesso: { selo: "bg-brand-pink-soft text-brand-primary", barra: "bg-brand-primary", icone: "check" },
  erro: { selo: "bg-status-danger-bg text-status-danger-text", barra: "bg-status-danger-text", icone: "fechar" },
  info: { selo: "bg-status-info-bg text-status-info-text", barra: "bg-status-info-text", icone: "seloVerificado" },
};

const VISIVEIS = 3;
const DEGRAU = 10;
const ESPACO = 8;

type PilhaProps = { toasts: DadosToast[]; onFechar: (id: number) => void };

export function PilhaToasts({ toasts, onFechar }: PilhaProps) {
  const [aberta, setAberta] = useState(false);
  const [alturas, setAlturas] = useState<Record<number, number>>({});
  const medir = useCallback((id: number, altura: number) => {
    setAlturas((a) => (a[id] === altura ? a : { ...a, [id]: altura }));
  }, []);

  const ordem = [...toasts].reverse();
  const alturaFrente = ordem[0] ? (alturas[ordem[0].id] ?? 0) : 0;
  const deslocamentos = ordem.map((_, i) =>
    ordem.slice(0, i).reduce((soma, t) => soma + (alturas[t.id] ?? 0) + ESPACO, 0),
  );
  const alturaAberta = ordem.length ? deslocamentos[ordem.length - 1] + (alturas[ordem[ordem.length - 1].id] ?? 0) : 0;
  const expandida = aberta && ordem.length > 0;

  return createPortal(
    <section
      aria-label="Notificações"
      onMouseEnter={() => setAberta(true)}
      onMouseLeave={() => setAberta(false)}
      onFocus={() => setAberta(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setAberta(false)}
      className="fixed right-24 bottom-24 z-[70] w-[360px] max-w-[calc(100vw-32px)]"
      style={{ height: expandida ? alturaAberta : alturaFrente }}
    >
      {ordem.map((toast, i) => (
        <ItemToast
          key={toast.id}
          toast={toast}
          posicao={i}
          aberta={expandida}
          deslocamento={expandida ? deslocamentos[i] : i * DEGRAU}
          alturaFrente={alturaFrente}
          onMedir={medir}
          onFechar={onFechar}
        />
      ))}
    </section>,
    document.body,
  );
}

type ItemProps = {
  toast: DadosToast;
  posicao: number;
  aberta: boolean;
  deslocamento: number;
  alturaFrente: number;
  onMedir: (id: number, altura: number) => void;
  onFechar: (id: number) => void;
};

function ItemToast({ toast, posicao, aberta, deslocamento, alturaFrente, onMedir, onFechar }: ItemProps) {
  const { id, tipo, titulo, descricao, icone, saindo } = toast;
  const estilo = estilos[tipo];
  const conteudo = useRef<HTMLDivElement>(null);
  const duracao = tipo === "erro" ? 8000 : 5000;
  const restante = useRef(duracao);
  const naFrente = posicao === 0;
  const atras = !aberta && !naFrente;

  useLayoutEffect(() => {
    const el = conteudo.current;
    if (!el) return;
    const observador = new ResizeObserver(() => onMedir(id, el.offsetHeight));
    observador.observe(el);
    return () => observador.disconnect();
  }, [id, onMedir]);

  useEffect(() => {
    if (aberta || saindo) return;
    const inicio = Date.now();
    const timer = setTimeout(() => onFechar(id), restante.current);
    return () => {
      clearTimeout(timer);
      restante.current -= Date.now() - inicio;
    };
  }, [aberta, saindo, id, onFechar]);

  const escala = aberta ? 1 : 1 - posicao * 0.05;
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      aria-hidden={atras || undefined}
      className={cn(
        "absolute right-0 bottom-0 w-full origin-top overflow-hidden rounded-lg border border-neutral-border bg-neutral-white shadow-dropdown",
        "transition-[transform,opacity,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        (saindo || posicao >= VISIVEIS) && "pointer-events-none opacity-0",
      )}
      style={{
        zIndex: 100 - posicao,
        height: atras && alturaFrente ? alturaFrente : undefined,
        transform: `translate(${saindo ? 24 : 0}px, ${-deslocamento}px) scale(${escala})`,
      }}
    >
      <div
        ref={conteudo}
        className={cn(
          "relative flex animate-[toast-entrada_300ms_cubic-bezier(0.22,1,0.36,1)] items-start gap-12 p-16 motion-reduce:animate-none",
          "transition-opacity duration-200",
          atras && "opacity-0",
        )}
      >
        <span className={cn("flex size-32 shrink-0 items-center justify-center rounded-full", estilo.selo)}>
          <Icon name={icone ?? estilo.icone} size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-4">
          <p className="text-label-bold">{titulo}</p>
          {descricao && <p className="text-caption-medium text-neutral-secondary">{descricao}</p>}
        </div>
        <button
          type="button"
          onClick={() => onFechar(id)}
          aria-label="Fechar aviso"
          tabIndex={atras ? -1 : undefined}
          className="flex size-24 shrink-0 items-center justify-center rounded-full text-neutral-secondary transition-colors hover:bg-brand-pink-soft hover:text-brand-primary"
        >
          <Icon name="fechar" size={16} />
        </button>
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-2 origin-left opacity-60 motion-reduce:hidden",
            "animate-[toast-tempo_linear_forwards]",
            estilo.barra,
          )}
          style={{ animationDuration: `${duracao}ms`, animationPlayState: aberta ? "paused" : "running" }}
        />
      </div>
    </div>
  );
}
