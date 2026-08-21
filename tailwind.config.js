/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Be Vietnam Pro"',
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Arial",
                    "sans-serif",
                ],
            },
            colors: {
                // Primary teal scale — matches the app logo's cyan/teal tone
                // (sampled ~#05AAC0), with a full ramp for hover/active/subtle
                // backgrounds. Capped at 700 for gradients so headers/hero
                // cards don't read as too dark.
                primary: {
                    50: "#ECFEFF",
                    100: "#CFFAFE",
                    200: "#A5F3FC",
                    300: "#67E8F9",
                    400: "#22D3EE",
                    500: "#05AAC0",
                    600: "#0891B2",
                    700: "#0E7490",
                    800: "#155E75",
                    900: "#164E63",
                    DEFAULT: "#05AAC0",
                },
                "primary-dark": "#0891B2",
                main: "#05AAC0",
                "app-bg": "#F5F7FA",
                wth_a70: "rgba(255, 255, 255, 0.7)",
                ui_bg: "#FFFFFF",
                text_1: "#111827",
                text_2: "#6B7280",
                text_3: "#9CA3AF",
                devider_1: "#E5E7EB",
                icon_bg: "#F5F9FC",
                blue_10: "#ECFEFF",
                ng_10: "#F4F5F6",
                ng_20: "#E9EBED",
                blk_a70: "rgba(0, 0, 0, 0.7)",
                blk_a20: "rgba(0, 0, 0, 0.2)",
                divider_01: "#E5E7EB",
                // Semantic accents used across stat tiles / status badges
                success: { DEFAULT: "#16A34A", bg: "#DCFCE7" },
                warning: { DEFAULT: "#D97706", bg: "#FEF3C7" },
                danger: { DEFAULT: "#DC2626", bg: "#FEE2E2" },
                info: { DEFAULT: "#4338CA", bg: "#E0E7FF" },
            },
            boxShadow: {
                card: "0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)",
                "card-hover":
                    "0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
            },
        },
    },
    plugins: [],
};
