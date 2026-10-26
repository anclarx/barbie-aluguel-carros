import { Link } from "react-router";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";

const colunas = [
  {
    titulo: "Alugue",
    links: [
      { label: "Explorar os veículos disponíveis", to: "/#veiculos" },
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
            <a href="#" aria-label="WhatsApp">
              <Icon name="whatsapp" size={28} />
            </a>
            <a href="#" aria-label="Instagram">
              <Icon name="instagram" size={28} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Icon name="linkedin" size={28} />
            </a>
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
          <p className="text-body-medium">
            <span className="text-body-bold">Fale conosco</span>
            <br />
            (31) 92713-0905
          </p>
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
