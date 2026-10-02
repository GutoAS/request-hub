import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = "secondary",
  fullWidth = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, fullWidth, className)}
      {...rest}
    />
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
}

export function ButtonLink({
  variant = "secondary",
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, false, className)} {...rest} />
  );
}

function buttonClasses(
  variant: ButtonVariant,
  fullWidth: boolean,
  extra?: string,
) {
  return [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}
