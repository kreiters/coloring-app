/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/coloring-app',
  assetPrefix: '/coloring-app',
  images: {
    unoptimized: true
  },
  devIndicators: {
    buildActivity: false
  }
}

module.exports = nextConfig