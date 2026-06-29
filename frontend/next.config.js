/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Allow iframe styling rules in monaco */
  transpilePackages: ['@monaco-editor/react']
}

module.exports = nextConfig
