import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import macrosPlugin from "vite-plugin-babel-macros";

import path from "path";

// https://vitejs.dev/config/
export default () => {
    return defineConfig({
        base: "./",
        plugins: [react(), macrosPlugin()],
        // twin.macro is a babel-plugin-macros macro (see babel-plugin-macros.config.js)
        // - it's meant to be fully compiled away by macrosPlugin() before the browser
        // ever sees it. Vite's dependency scanner doesn't apply babel transforms though,
        // so it sees the raw `import ... from "twin.macro"` in ~28 component files and
        // tries to pre-bundle the real twin.macro package for the browser. That drags in
        // the whole tailwindcss package (config-loading via cosmiconfig/jiti/resolve),
        // which needs Node's `fs` and fails esbuild's browser-target pre-bundle with
        // "Failed to resolve entry for package 'fs'". Excluding it here skips that dead-end
        // scan - twin.macro never needs a real runtime bundle since the macro erases it.
        optimizeDeps: {
            exclude: ["twin.macro"],
        },
        build: {
            outDir: "www",
            emptyOutDir: true,
            target: "es2020",
            rollupOptions: {
                output: {
                    manualChunks: {
                        "vendor-react": [
                            "react",
                            "react-dom",
                            "react-router",
                            "react-router-dom",
                        ],
                        "vendor-ui": [
                            "styled-components",
                            "react-datepicker",
                            "@xuannghia/html2canvas",
                        ],
                    },
                },
            },
        },
        resolve: {
            alias: {
                "@assets": path.resolve(__dirname, "src/assets"),
                "@components": path.resolve(__dirname, "src/components"),
                "@common": path.resolve(__dirname, "src/common"),
                "@constants": path.resolve(__dirname, "src/constants"),
                "@routes": path.resolve(__dirname, "src/routes"),
                "@shared": path.resolve(__dirname, "src/shared"),
                "@utils": path.resolve(__dirname, "src/utils"),
                "@pages": path.resolve(__dirname, "src/pages"),
                "@dts": path.resolve(__dirname, "src/types"),
                "@state": path.resolve(__dirname, "src/state"),
                "@service": path.resolve(__dirname, "src/service"),
                "@store": path.resolve(__dirname, "src/store"),
                "@mock": path.resolve(__dirname, "src/mock"),
                "@hooks": path.resolve(__dirname, "src/hooks"),
            },
        },
    });
};
