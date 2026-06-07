/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes under src/app/api/* proxy to the backend via RENDER_BACKEND_URL
  // and apply mock fallbacks — do not rewrite /api/* directly to the backend.
};

module.exports = nextConfig;