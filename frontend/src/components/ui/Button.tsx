import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "danger" | "link";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-neutral-white border border-brand-primary hover:bg-brand-primary-hover hover:border-brand-primary-hover",
  secondary:
    "bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-pink-soft",
  danger:
    "bg-transparent text-status-danger-text border border-status-danger-text hover:bg-status-danger-bg",
  link: "bg-transparent text-brand-primary underline hover:text-brand-primary-hover",
};

const sizes: Record<Size, string> = {
  md: "h-38 px-20",
  lg: "h-46 px-28",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-8 rounded-pill text-body-bold whitespace-nowrap transition-colors disabled:opacity-50",
        variant !== "link" && sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
