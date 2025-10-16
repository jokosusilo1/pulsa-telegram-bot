/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pulsa-api.onrender.com'
  }
}

module.exports = nextConfig
