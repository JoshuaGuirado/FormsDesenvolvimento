import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CSS, JS e imagens ficam em /forms-static/_next/..., para os formulários funcionarem também
  // dentro do site da Linka (www.linkamidia.com.br/formsbriefing) sem conflitar com os arquivos dele.
  assetPrefix: "/forms-static",
  // O painel e a API nunca aparecem no Google nem em outros buscadores.
  async headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];
    return [
      { source: "/admin/:path*", headers: [...noIndex, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin", headers: [...noIndex, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/:path*", headers: noIndex },
    ];
  },
};

export default nextConfig;
