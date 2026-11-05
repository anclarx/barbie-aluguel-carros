import type { FormEvent, ReactNode } from "react";
import { Icon } from "../ui/Icon";

type AuthPageProps = {
  titulo: string;
  descricao: ReactNode;
  topo?: ReactNode;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  rodape?: ReactNode;
};

export function AuthPage({ titulo, descricao, topo, onSubmit, children, rodape }: AuthPageProps) {
  return (
    <div className="flex flex-col gap-32">
      {topo}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-32">
        <div className="flex flex-col gap-4">
          <h1 className="text-heading-bold">{titulo}</h1>
          <p className="text-body-medium">{descricao}</p>
        </div>
        {children}
      </form>
      {rodape && <div className="flex flex-col gap-24">{rodape}</div>}
    </div>
  );
}

export function AuthSucesso({ titulo, descricao, children }: { titulo: string; descricao: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-24 text-center">
      <span className="flex size-114 items-center justify-center rounded-full bg-brand-primary text-neutral-white">
        <Icon name="check" size={72} />
      </span>
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-bold">{titulo}</h1>
        <p className="text-body-medium">{descricao}</p>
      </div>
      {children}
    </div>
  );
}
