import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Ao trocar de página, volta ao topo em vez de manter a rolagem da página anterior.
 * Links com âncora (ex.: "/#faq" no rodapé) rolam até a seção.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const alvo = hash ? document.getElementById(hash.slice(1)) : null;
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
