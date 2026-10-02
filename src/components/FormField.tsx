import { useId, type ReactNode } from "react";
import form from "./form.module.css";

export interface FieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  label: string;

  error?: string;

  help?: string;

  footer?: ReactNode;
  className?: string;

  children: (control: FieldControlProps) => ReactNode;
}

export function FormField({
  label,
  error,
  help,
  footer,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy =
    [error && errorId, help && helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[form.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={form.label}>
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {error && (
        <p id={errorId} className={form.error}>
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className={form.help}>
          {help}
        </p>
      )}
      {footer}
    </div>
  );
}
