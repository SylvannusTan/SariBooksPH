import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist", // Output directory for the build
    rollupOptions: {
      input: {
        main: "index.html", // Entry point for the application
      },
    },
  },
})
