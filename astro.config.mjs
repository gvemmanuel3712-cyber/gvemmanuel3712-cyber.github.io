import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://gvemmanuel3712-cyber.github.io",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
