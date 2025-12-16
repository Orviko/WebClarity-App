// @ts-expect-error - PrismaPlugin is not typed
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import nextIntlPlugin from "next-intl/plugin";

const withNextIntl = nextIntlPlugin("./modules/i18n/request.ts");

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/api", "@repo/auth", "@repo/database"],
	images: {
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// github profile images
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				// share OG images
				protocol: "https",
				hostname: "share-og.webclarity.ai",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/workspace/:organizationSlug/settings",
				destination: "/workspace/:organizationSlug/settings/general",
				permanent: true,
			},
			// Legacy redirects for old URLs
			{
				source: "/app/admin/:path*",
				destination: "/admin/:path*",
				permanent: true,
			},
			{
				source: "/app/:organizationSlug/:path*",
				destination: "/workspace/:organizationSlug/:path*",
				permanent: true,
			},
			// Catch-all redirect for /app without params (from old verification emails)
			{
				source: "/app",
				destination: "/workspace",
				permanent: false, // Use temporary redirect since this is for migration
			},
		];
	},
	webpack: (config, { webpack, isServer }) => {
		config.plugins.push(
			new webpack.IgnorePlugin({
				resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
			}),
		);

		if (isServer) {
			config.plugins.push(new PrismaPlugin());
		}

		return config;
	},
};

export default withNextIntl(nextConfig);
