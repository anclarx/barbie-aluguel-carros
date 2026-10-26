import { Link } from "react-router";
import { cn } from "../../lib/cn";

export function Logo({ size = "header", className }: { size?: "header" | "footer"; className?: string }) {
  return (
    <Link
      to="/"
      className={cn("text-brand-primary", size === "header" ? "text-logo-header" : "text-logo-footer", className)}
    >
      PinkGo
    </Link>
  );
}
