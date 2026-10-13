import styles from "./Footer.module.css";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={`${styles.column} ${styles.logoColumn}`}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <img src="/images/logo-linka-footer.png" alt="Linka Mídia" className={styles.logoImg} />
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Contato</h3>
          <a href="mailto:contato@linkamidia.com.br" className={styles.infoItem}>
            <svg {...iconProps} width="24" height="24">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>contato@linkamidia.com.br</span>
          </a>
          <a href="tel:+5544998019947" className={styles.infoItem}>
            <svg {...iconProps} width="24" height="24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>(44) 99801-9947</span>
          </a>

          <div className={styles.socialWrapper}>
            <a
              href="https://www.instagram.com/linkamidia_?igsh=bzVwaTcwOG9iM2Rt"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <svg {...iconProps} width="20" height="20">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/linkamidia/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <svg {...iconProps} width="20" height="20">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Endereço</h3>
          <div className={styles.infoItem} style={{ alignItems: "flex-start" }}>
            <div style={{ marginTop: "4px" }}>
              <svg {...iconProps} width="24" height="24">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span>
              Av. Carneiro Leão, 833 - Sala 04
              <br />
              Maringá, PR
            </span>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.copyright}>
        <span>© {new Date().getFullYear()} Linka Mídia. Todos os direitos reservados.</span>
        <span style={{ display: "inline-block", margin: "0 5px" }}>|</span>
        <span>CNPJ: 43.961.116/0001-08</span>
      </div>
    </footer>
  );
}
