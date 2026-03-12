import type { NextConfig } from "next";

const isToss = process.env.BUILD_TARGET === "toss";

const nextConfig: NextConfig = {
  ...(isToss && {
    output: "export",
    distDir: "dist",
  }),
};

export default nextConfig;
