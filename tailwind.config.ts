import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // void: deep ink background
        void: {
          DEFAULT: "#0e0c0a",
          50: "#1a1714",
          100: "#15120f",
          200: "#100d0b",
        },
        // parchment: warm bone foreground (brightened for AA)
        parch: {
          DEFAULT: "#e6dcc6",
          dim: "#c0b59e",
          faint: "#8e8474",
          ghost: "#5a5446",
        },
        // ember: the single accent
        ember: {
          DEFAULT: "#d4b97c",
          deep: "#c9a96e",
          dim: "#a08654",
          glow: "#e6c896",
        },
        // blood: rare, used sparingly for "complete" or destruction
        blood: "#7a3a2c",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
