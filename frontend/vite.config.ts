import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em dev o front chama /api no mesmo endereço e o Vite repassa para o Spring, sem precisar de CORS.
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        // O navegador manda `Origin` nos POST/PUT/DELETE e o Spring só aceita a do CORS (5173). Pelo proxy a
        // chamada já é da mesma origem, então o cabeçalho sai: o front funciona mesmo se o Vite cair em outra porta.
        configure: (proxy) => proxy.on("proxyReq", (req) => req.removeHeader("origin")),
      },
    },
  },
});
