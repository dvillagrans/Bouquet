import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.160"],
  // Tunnel support: disable server action origin validation in dev
  ...(!isProd ? {
    experimental: {
      serverActions: {
        allowedOrigins: ["*"],
      },
    },
  } as any : {}),
  // CSP only in production — tunnel/proxy setups break with strict CSP in dev
  ...(!isProd ? {} : {
    async headers() {
      return [
        {
          source: "/((?!_next/static|_next/image|favicon.ico).*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self'",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
                "frame-src 'self' https://challenges.cloudflare.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join("; "),
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=(), payment=()",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
