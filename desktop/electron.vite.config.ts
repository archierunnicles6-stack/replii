import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin, type Plugin } from "electron-vite";
import react from "@vitejs/plugin-react";

// file:// in Electron does not send CORS headers — crossorigin assets fail to load.
function removeCrossoriginPlugin(): Plugin {
  return {
    name: "remove-crossorigin",
    transformIndexHtml(html) {
      return html.replace(/\s*crossorigin(="[^"]*")?/gi, "");
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    base: "./",
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
      },
    },
    plugins: [react(), removeCrossoriginPlugin()],
    build: {
      modulePreload: { polyfill: false },
    },
  },
});
