import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
