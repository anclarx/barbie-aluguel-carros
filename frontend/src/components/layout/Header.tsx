import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Icon, type IconName } from "../ui/Icon";
import { Logo } from "../ui/Logo";

const itemNav = (ativo: boolean) =>
  cn("inline-flex items-center gap-4 text-body-bold", ativo ? "text-brand-primary" : "text-neutral-text hover:text-brand-primary");

function NavItem({ to, icon, children }: { to: string; icon: IconName; children: string }) {
  return (
    <NavLink to={to} end className={({ isActive }) => itemNav(isActive)}>
      <Icon name={icon} size={24} />
      {children}
    </NavLink>
  );
}

function MenuPerfil() {
  const { cliente, sair } = useApp();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [aberto]);

  if (!cliente) return null;

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)} className={itemNav(aberto)}>
        <Icon name="usuario" size={24} />
        Meu perfil
        <Icon name="seta" size={20} rotate={aberto ? 0 : 180} />
      </button>
      {aberto && (
        <div className="absolute top-40 left-0 z-40 flex w-243 flex-col gap-12 rounded-lg border border-neutral-border bg-neutral-white p-16">
          <div className="flex flex-col border-b border-neutral-border pb-8">
            <span className="text-body-bold">{cliente.nome}</span>
            <span className="text-caption-semibold text-neutral-secondary">{cliente.email}</span>
          </div>
          <Link
            to="/perfil"
            onClick={() => setAberto(false)}
            className="flex items-center gap-4 border-b border-neutral-border pb-8 text-body-bold hover:text-brand-primary"
          >
            <Icon name="lapis" size={20} />
            Editar dados cadastrais
          </Link>
          <button
            type="button"
            onClick={() => {
              sair();
              navigate("/");
            }}
            className="flex items-center gap-4 text-body-bold hover:text-brand-primary"
          >
            <Icon name="saida" size={20} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

/** `variant="auth"` esconde navegação e botões (telas de login e cadastro). */
export function Header({ variant = "default" }: { variant?: "default" | "auth" }) {
  const { cliente } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-border bg-neutral-white">
      <div className="mx-auto grid h-64 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-64">
        <Logo className="justify-self-start" />

        {variant === "default" && cliente ? (
          <nav className="flex items-center gap-32">
            <NavItem to="/" icon="casa">
              Início
            </NavItem>
            <NavItem to="/pedidos" icon="lista">
              Meus pedidos
            </NavItem>
            <MenuPerfil />
          </nav>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-16 justify-self-end">
          {variant === "default" && !cliente && (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Entrar
              </Button>
              <Button onClick={() => navigate("/cadastro")}>Criar conta</Button>
            </>
          )}
          <div className="flex items-center gap-8 text-brand-primary">
            <button type="button" aria-label="Suporte">
              <Icon name="suporte" size={28} />
            </button>
            <button type="button" aria-label="Acessibilidade">
              <Icon name="acessibilidade" size={28} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
