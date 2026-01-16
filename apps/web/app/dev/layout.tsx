import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

/**
 * Development-only layout wrapper.
 * This layout ensures that all routes under /dev are only accessible
 * in development mode (localhost or non-production environments).
 *
 * In production, accessing any /dev route will return a 404.
 */
export default function DevLayout({ children }: PropsWithChildren) {
	// Check if we're in development mode
	const isDevelopment = process.env.NODE_ENV === "development";

	// Also check for preview/dev environments that might not be localhost
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
	const isLocalhost =
		appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
	const isPreview =
		appUrl.includes("vercel.app") || appUrl.includes("preview");

	// Allow access only in development or preview environments
	const isDevEnvironment = isDevelopment || isLocalhost || isPreview;

	if (!isDevEnvironment) {
		notFound();
	}

	return <>{children}</>;
}
