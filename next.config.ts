import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * O celular acessa o dev server pelo IP da rede local. Sem liberar esse host,
   * o Next bloqueia os recursos de dev (HMR e chunks) e a página não hidrata:
   * o formulário cai no submit nativo e o JS do app nunca roda.
   */
  allowedDevOrigins: ["192.168.1.106"],
};

export default nextConfig;
