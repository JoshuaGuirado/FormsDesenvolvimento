import logo from "@/public/images/logo-linka.png";
import { withBase } from "@/lib/base-path";
import styles from "./Footer.module.css";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 16,
  height: 16,
  "aria-hidden": true,
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <img src={logo.src} alt="Linka Mídia" className={styles.logo} />

        <div className={styles.links}>
          <a href="mailto:contato@linkamidia.com.br" className={styles.item}>
            <svg {...iconProps}>
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            contato@linkamidia.com.br
          </a>
          <a href="https://wa.me/5544998019947" target="_blank" rel="noopener noreferrer" className={styles.item}>
            <svg {...iconProps}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            (44) 99801-9947
          </a>
          <a
            href="https://www.instagram.com/linkamidia_?igsh=bzVwaTcwOG9iM2Rt"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.social}
            aria-label="Instagram"
          >
            <svg {...iconProps}>
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/linkamidia/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.social}
            aria-label="LinkedIn"
          >
            <svg {...iconProps}>
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>

      <p className={styles.copyright}>
        © {new Date().getFullYear()} Linka Mídia · Av. Carneiro Leão, 833 - Sala 04, Maringá - PR · CNPJ
        43.961.116/0001-08 ·{" "}
        <a href={withBase("/admin")} rel="nofollow" className={styles.teamLink}>
          Área da equipe
        </a>
      </p>
    </footer>
  );
}
