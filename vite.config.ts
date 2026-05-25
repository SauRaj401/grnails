import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const phpBackendTarget =
	process.env.VITE_PHP_BACKEND_URL || process.env.PHP_BACKEND_URL || "http://127.0.0.1:80";

export default defineConfig({
	plugins: [tanstackRouter(), react(), tailwindcss(), tsconfigPaths()],
	server: {
		proxy: {
			"/api": {
				target: phpBackendTarget,
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
});
