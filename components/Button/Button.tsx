import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
  isLoading?: boolean;
};

export default function Button({ children, href, onClick, type = "button", variant = "primary", isLoading = false }: ButtonProps) {
  const className = `${styles.button} ${variant === "ghost" ? styles.ghost : ""} ${isLoading ? styles.loading : ""}`;

  if (href) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className} disabled={isLoading}>
      <span>{isLoading ? "Enviando..." : children}</span>
    </button>
  );
}
