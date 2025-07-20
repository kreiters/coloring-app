/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/coloring-app',
  assetPrefix: '/coloring-app',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig