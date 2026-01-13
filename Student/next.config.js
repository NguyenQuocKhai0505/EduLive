/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-c.udemycdn.com',
      },
      {
        protocol: "https",
        hostname:'img.freepik.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Thêm luôn trang này để sau này dùng
      },
      {
        protocol: 'https',
        hostname: 'frontends.udemycdn.com', // <--- THÊM CÁI MỚI NÀY VÀO
      },
      {
        protocol: "https",
        hostname: "files.fullstack.edu.vn", // 👇 Thêm domain này vào
      },
    ],
  },
}
module.exports = nextConfig
