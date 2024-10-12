import type { Config } from "tailwindcss";
import catppuccin from '@catppuccin/daisyui'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'lg': '1rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["luxury", catppuccin("mocha")],
  },
};
export default config;
