/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Spotify's CDN (for artist/album art)
  images: {
    domains: ['i.scdn.co'],
  },
};

module.exports = nextConfig;