import { Link } from "react-router";
import { Icon, type IconName } from "../ui/Icon";
import { Logo } from "../ui/Logo";

const redes: Array<{ icon: IconName; label: string }> = [
  { icon: "whatsapp", label: "WhatsApp" },
  { icon: "instagram", label: "Instagram" },
  { icon: "linkedin", label: "LinkedIn" },
];

const colunas = [
  {
    titulo: "Alugue",
    links: [
      { label: "Explorar os veículos disponíveis", to: "/#busca" },
      { label: "Como funciona", to: "/#como-funciona" },
      { label: "Perguntas frequentes", to: "/#faq" },
    ],
  },
  {
    titulo: "Ajuda",
    links: [
      { label: "Perguntas frequentes", to: "/#faq" },
      { label: "Documentos necessários", to: "/#faq" },
      { label: "Como funciona a análise financeira", to: "/#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-border bg-neutral-white">
      <div className="mx-auto flex h-200 max-w-[1440px] items-start justify-between px-64 py-32">
        <div className="flex h-full w-295 flex-col justify-between">
          <Logo size="footer" />
          <div className="flex gap-8 text-neutral-text">
            {redes.map(({ icon, label }) => (
              <a key={icon} href="#" aria-label={label} className="transition-colors hover:text-brand-primary">
                <Icon name={icon} size={28} />
              </a>
            ))}
          </div>
        </div>

        {colunas.map((coluna) => (
          <div key={coluna.titulo} className="flex flex-col gap-16 pt-8">
            <span className="text-body-bold">{coluna.titulo}</span>
            <ul className="flex flex-col gap-8">
              {coluna.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-body-medium hover:text-brand-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col">
            <span className="text-body-bold">Fale conosco</span>
            <a
              href="tel:+5531927130905"
              className="inline-flex items-center gap-4 text-body-medium transition-colors hover:text-brand-primary"
            >
              <Icon name="telefone" size={20} />
              (31) 92713-0905
            </a>
          </div>
          <p className="text-body-medium">
            ©2026
            <br />
            Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
