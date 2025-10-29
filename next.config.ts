import type {NextConfig} from 'next'
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const isProd = process.env.NODE_ENV === 'production'

const withPWA = require('next-pwa')({
  disable: !isProd,
  skipWaiting: true,
  dest: 'public',
  include: ['**/*.css'], // すべてのCSSファイルをプリキャッシュする
  runtimeCaching: [
    {
      urlPattern: /.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'https-cache',
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {bodySizeLimit: '10mb'},
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: '**kickswrap.com'},
      {protocol: 'https', hostname: '**.amazonaws.com'},
      {protocol: 'https', hostname: '**drive.google.com**'},
    ],
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // SEO最適化
  compress: true,
  poweredByHeader: false,

  // ヘッダー最適化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-XSS-Protection', value: '1; mode=block'},
          {key: 'Referrer-Policy', value: 'origin-when-cross-origin'},
        ],
      },
      {source: '/image/(.*)', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]},
      {source: '/api/(.*)', headers: [{key: 'Cache-Control', value: 'no-store, max-age=0'}]},
    ]
  },
}
// export default nextConfig

export default isProd ? withPWA(nextConfig) : nextConfig
