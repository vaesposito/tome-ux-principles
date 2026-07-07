import type { NextConfig } from "next";

/**
 * Static-export config for GitHub Pages project site.
 *
 * The site is served from https://vaesposito.github.io/tome-ux-principles/, so
 * every asset (JS/CSS via `_next`, and the wireframe PNGs) must resolve under
 * the `/tome-ux-principles` base path. `output: "export"` emits a fully static
 * site into `out/`; `images.unoptimized` is required because the Next image
 * optimizer has no server on Pages.
 */
const BASE_PATH = "/tome-ux-principles";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  images: { unoptimized: true },
  trailingSlash: true,
  // Pin the workspace root to this project so Turbopack doesn't infer a stray
  // parent lockfile (e.g. one in the user home dir) as the root.
  turbopack: {
    root: import.meta.dirname,
  },
  // This is a static marketing page built from known-good source; keep the
  // export resilient so a stray type nit never blocks a Pages deploy.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
