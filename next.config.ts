import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Todo o app (páginas, painel, API, CSS, JS e imagens) fica sob /forms, para rodar dentro do
  // site da Linka (www.linkamidia.com.br/forms/...) via rewrite, sem conflitar com os arquivos dele.
  // Mantenha igual a BASE_PATH em lib/base-path.ts.
  basePath: "/forms",
  // O painel e a API nunca aparecem no Google nem em outros buscadores.
  async headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];
    return [
      { source: "/admin/:path*", headers: [...noIndex, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin", headers: [...noIndex, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/:path*", headers: noIndex },
    ];
  },
  // Endereços antigos (sem /forms) continuam funcionando no domínio da Vercel.
  async redirects() {
    return [
      { source: "/", destination: "/forms", basePath: false, permanent: false },
      { source: "/formsbriefing", destination: "/forms/briefing", basePath: false, permanent: false },
      { source: "/formsseletivo", destination: "/forms/seletivo", basePath: false, permanent: false },
      { source: "/admin", destination: "/forms/admin", basePath: false, permanent: false },
      { source: "/admin/:path*", destination: "/forms/admin/:path*", basePath: false, permanent: false },
    ];
  },
};

export default nextConfig;
