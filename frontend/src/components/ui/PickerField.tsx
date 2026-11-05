import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { formatData } from "../../lib/format";
import { Icon, type IconName } from "./Icon";

const caixa =
  "relative flex h-54 w-full items-center gap-12 rounded-md border border-neutral-border px-16 text-body-medium text-neutral-text focus-within:border-brand-primary";

type MolduraProps = { label: string; htmlFor: string; error?: string; children: ReactNode };

function Moldura({ label, htmlFor, error, children }: MolduraProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <label htmlFor={htmlFor} className="text-body-medium text-neutral-secondary">
        {label}
      </label>
      {children}
      {error && <span className="text-label-medium text-status-danger-text">{error}</span>}
    </div>
  );
}

type PickerSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  error?: string;
  icon: IconName;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
};

export function PickerSelect({ label, error, icon, placeholder, options, id, ...props }: PickerSelectProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Moldura label={label} htmlFor={inputId} error={error}>
      <div className={cn(caixa, error && "border-status-danger-text")}>
        <Icon name={icon} size={20} className="pointer-events-none shrink-0" />
        <select
          id={inputId}
          className="absolute inset-0 cursor-pointer appearance-none truncate bg-transparent pr-48 pl-48 outline-none"
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="seta" rotate={180} size={16} className="pointer-events-none ml-auto shrink-0" />
      </div>
    </Moldura>
  );
}

type PickerDateProps =Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  label: string;
  error?: string;
  value: string;
};

export function PickerDate({ label, error, id, value, ...props }: PickerDateProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Moldura label={label} htmlFor={inputId} error={error}>
      <div className={cn(caixa, error && "border-status-danger-text")}>
        <Icon name="calendario" size={20} className="pointer-events-none shrink-0" />
        <span className="pointer-events-none truncate">{value ? formatData(value) : "Data"}</span>
        <input
          id={inputId}
          type="date"
          value={value}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch {
            }
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
          {...props}
        />
      </div>
    </Moldura>
  );
}
