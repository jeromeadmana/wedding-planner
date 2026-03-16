/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pg tries to load a native binding that doesn't exist in this env
    config.externals.push({ "pg-native": "commonjs pg-native" })
    return config
  },
  async headers() {
    return [
      {
        source: "/e/:slug*",
        headers: [{ key: "X-Saya-Public", value: "1" }],
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default nextConfig
