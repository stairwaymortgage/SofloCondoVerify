/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // /advertise was live and may be indexed. The page is gone, but a 404 would
  // throw away whatever equity the URL has — send it to the home page instead.
  async redirects() {
    return [{ source: "/advertise", destination: "/", permanent: true }];
  },
};
export default nextConfig;
