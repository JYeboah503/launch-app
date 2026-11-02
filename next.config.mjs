/** @type {import('next').NextConfig} */

// Fully static prototype — everything is client-side + localStorage, so the
// build exports to plain files deployable on any static host. PAGES_BASE
// lets the GitHub Pages deploy build under its /launch-app subpath without
// affecting local dev (which runs at the root).
const base = process.env.PAGES_BASE || ''

const nextConfig = {
  output: 'export',
  basePath: base,
  assetPrefix: base,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
