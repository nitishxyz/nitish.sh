// @ts-check
import * as fs from "node:fs";
import mdx from "@astrojs/mdx";
import opengraphImages from "astro-opengraph-images";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { renderOpenGraphImage } from "./og-image-renderer.mjs";

export default defineConfig({
  site: "https://nitish.sh",
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
    opengraphImages({
      options: {
        fonts: [
          {
            name: "Inter",
            weight: 400,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
          },
          {
            name: "Inter",
            weight: 500,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-500-normal.woff"),
          },
          {
            name: "Inter",
            weight: 700,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
          },
        ],
      },
      render: renderOpenGraphImage,
    }),
  ],
});
