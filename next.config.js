/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/coloring-app',
  assetPrefix: '/coloring-app/',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig