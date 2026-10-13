/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Blog posts carry a `heroImage` that is an arbitrary absolute URL emitted by
  // the auto-post engine, so next/image has to be allowed to optimize any
  // https host. The blog is the only place remote images are used.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // /advertise was live and may be indexed. The page is gone, but a 404 would
  // throw away whatever equity the URL has — send it to the home page instead.
  async redirects() {
    return [{ source: "/advertise", destination: "/", permanent: true }];
  },
};
export default nextConfig;
