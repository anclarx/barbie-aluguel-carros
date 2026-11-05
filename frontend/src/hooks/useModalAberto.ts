import { useEffect } from "react";

/** Enquanto o modal está aberto: Esc fecha e a página de trás não rola. */
export function useModalAberto(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // No html também: com o scrollbar-gutter da página, travar só o body ainda deixa a janela rolar.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
}
