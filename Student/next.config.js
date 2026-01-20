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
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'frontends.udemycdn.com', 
      },
      {
        protocol: "https",
        hostname: "files.fullstack.edu.vn", 
      },
      {
        protocol: 'https',
        hostname: 'example.com', 
      },
      {
        protocol: 'http',
        hostname: 'localhost', 
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✨ Cloudinary images
      },
    ],
  },
}
module.exports = nextConfig
