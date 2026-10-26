import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

const caixa =
  "h-46 w-full rounded-md border border-neutral-border bg-neutral-white px-16 text-body-medium text-neutral-text placeholder:text-neutral-text outline-none focus:border-brand-primary";

type LabelProps = { label?: string; htmlFor: string; error?: string; className?: string; children: ReactNode };

function Campo({ label, htmlFor, error, className, children }: LabelProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-body-medium text-neutral-secondary">
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-label-medium text-status-danger-text">{error}</span>}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export function TextField({ label, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo label={label} htmlFor={inputId} error={error} className={className}>
      <input id={inputId} className={cn(caixa, error && "border-status-danger-text")} {...props} />
    </Campo>
  );
}

export function PasswordField({ label, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visivel, setVisivel] = useState(false);
  return (
    <Campo label={label} htmlFor={inputId} error={error} className={className}>
      <div className="relative">
        <input
          id={inputId}
          type={visivel ? "text" : "password"}
          className={cn(caixa, "pr-48", error && "border-status-danger-text")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute top-1/2 right-16 -translate-y-1/2 text-neutral-text"
        >
          <Icon name={visivel ? "olhoAberto" : "olhoFechado"} size={20} />
        </button>
      </div>
    </Campo>
  );
}

export function DateField({ label, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo label={label} htmlFor={inputId} error={error} className={className}>
      <div className="relative">
        <input
          id={inputId}
          type="date"
          className={cn(
            caixa,
            "pr-48 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-12 [&::-webkit-calendar-picker-indicator]:size-24 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            error && "border-status-danger-text",
          )}
          {...props}
        />
        <Icon
          name="calendario"
          size={20}
          className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 text-neutral-text"
        />
      </div>
    </Campo>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
};

export function SelectField({ label, error, className, id, placeholder, options, ...props }: SelectFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo label={label} htmlFor={inputId} error={error} className={className}>
      <div className="relative">
        <select id={inputId} className={cn(caixa, "appearance-none pr-48", error && "border-status-danger-text")} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="seta"
          rotate={180}
          size={16}
          className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 text-neutral-text"
        />
      </div>
    </Campo>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children?: ReactNode };

export function Checkbox({ children, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer items-start gap-8", className)}>
      <span className="relative mt-[1px] inline-flex size-20 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-20 cursor-pointer appearance-none rounded-sm border border-neutral-border bg-neutral-white checked:border-brand-primary checked:bg-brand-primary"
          {...props}
        />
        <Icon
          name="check"
          size={16}
          className="pointer-events-none absolute top-2 left-2 hidden text-neutral-white peer-checked:block"
        />
      </span>
      {children}
    </label>
  );
}
