import { useContext } from "react";
import { ToastContext } from "../context/toastContext";

/** `const toast = useToast(); toast.sucesso("Pedido enviado", "Ele já está em análise.")` */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
