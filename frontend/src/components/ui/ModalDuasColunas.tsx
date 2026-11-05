import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalAberto } from "../../hooks/useModalAberto";
import { CabecalhoModal } from "./CabecalhoModal";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Linha pequena acima do título (ex.: "Pedido #P12"). */
  contexto?: ReactNode;
  /** Selo à esquerda do título (ex.: status do pedido). */
  selo?: ReactNode;
  title: string;
  /** Coluna da direita (resumo e botões): fica parada enquanto a esquerda rola. */
  aside: ReactNode;
  /** Coluna da esquerda, que rola com o modal. */
  children: ReactNode;
};

/**
 * Modal de duas colunas dos pedidos (Figma "Modal periodo e confirmacao" e "Modal editar pedido").
 * Quem rola é o fundo escuro, então a rolagem funciona com o mouse em qualquer lugar e sem barra visível; o
 * cabeçalho fica no topo e a coluna da direita é sticky, como no checkout da Localrent.
 */
export function ModalDuasColunas({ open, onClose, contexto, selo, title, aside, children }: Props) {
  useModalAberto(open, onClose);
  if (!open) return null;

  // Clicar fora do modal (no fundo ou nas margens) fecha.
  const fecharSeFora = (e: MouseEvent) => e.target === e.currentTarget && onClose();

  return createPortal(
    <div className="scrollbar-oculta fixed inset-0 z-50 overflow-y-auto bg-backdrop" onMouseDown={fecharSeFora}>
      <div className="flex min-h-full items-start justify-center px-16 py-32" onMouseDown={fecharSeFora}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-modal-lg rounded-lg border border-neutral-border bg-neutral-white"
        >
          <CabecalhoModal
            title={title}
            contexto={contexto}
            selo={selo}
            onClose={onClose}
            className="sticky top-0 z-10 rounded-t-lg bg-neutral-white"
          />
          <div className="grid grid-cols-2 items-start gap-24 p-16 pb-32">
            <div className="flex min-w-0 flex-col gap-24">{children}</div>
            {/* 76px = cabeçalho de 60px + 16px de respiro. Se o resumo não couber na tela, ele rola por dentro. */}
            <aside className="scrollbar-oculta sticky top-76 flex max-h-[calc(100vh-108px)] min-w-0 flex-col gap-16 overflow-y-auto">
              {aside}
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
