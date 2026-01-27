/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'unlocomotive-unthreateningly-arlena.ngrok-free.dev',
  ],
}

export default nextConfig
