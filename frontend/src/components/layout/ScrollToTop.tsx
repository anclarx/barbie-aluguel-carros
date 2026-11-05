import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const alvo = hash ? document.getElementById(hash.slice(1)) : null;
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
