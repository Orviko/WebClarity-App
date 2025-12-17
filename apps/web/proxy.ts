import { routing } from "@i18n/routing";
import { auth } from "@repo/auth";
import { config as appConfig } from "@repo/config";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withQuery } from "ufo";

const intlMiddleware = createMiddleware(routing);

/**
 * Helper function to get user's default workspace slug
 * Makes ONE database call to fetch organizations
 */
async function getDefaultWorkspaceSlug(
	req: NextRequest,
	session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
): Promise<string | null> {
	try {
		// Use Better-Auth's API to list user's organizations
		const organizations = await auth.api.listOrganizations({
			headers: req.headers,
		});

		if (!organizations || organizations.length === 0) {
			return null;
		}

		// Find active organization or use first one
		const activeOrg = organizations.find(
			(org) => org.id === session.session.activeOrganizationId,
		);

		return activeOrg?.slug || organizations[0]?.slug || null;
	} catch (error) {
		console.error("Error fetching organizations in proxy:", error);
		return null;
	}
}

/**
 * Next.js Proxy (Middleware) for Route Protection
 *
 * This proxy runs on the Edge Runtime and handles:
 * - Authentication checks for protected routes
 * - DIRECT redirects to user's workspace (no intermediate pages)
 * - Onboarding status validation
 * - Internationalization for marketing pages
 *
 * Key Feature: ONE database call, ONE redirect, ONE loading screen
 */
export default async function proxy(req: NextRequest) {
	const { pathname, origin } = req.nextUrl;

	// Get session using Better-Auth for detailed checks
	const session = await auth.api.getSession({
		headers: req.headers,
	});

	// Handle root path "/" - redirect authenticated users directly to their workspace
	if (pathname === "/" && session) {
		// Check onboarding status first
		if (
			appConfig.users.enableOnboarding &&
			!session.user.onboardingComplete
		) {
			return NextResponse.redirect(new URL("/onboarding", origin));
		}

		// Get workspace slug and redirect DIRECTLY (skip /workspace intermediate)
		const workspaceSlug = await getDefaultWorkspaceSlug(req, session);

		if (workspaceSlug) {
			return NextResponse.redirect(
				new URL(`/workspace/${workspaceSlug}`, origin),
			);
		}

		// No workspace found - send to onboarding
		return NextResponse.redirect(new URL("/onboarding", origin));
	}

	// Handle /workspace routes
	if (pathname.startsWith("/workspace")) {
		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		// Check authentication
		if (!session) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", {
						redirectTo: pathname,
					}),
					origin,
				),
			);
		}

		// Handle /workspace base URL - redirect DIRECTLY to user's workspace
		// This is the key change: no intermediate page, direct redirect
		if (pathname === "/workspace" || pathname === "/workspace/") {
			// Check onboarding status if enabled
			if (
				appConfig.users.enableOnboarding &&
				!session.user.onboardingComplete
			) {
				return NextResponse.redirect(new URL("/onboarding", origin));
			}

			// Get workspace slug and redirect DIRECTLY
			const workspaceSlug = await getDefaultWorkspaceSlug(req, session);

			if (workspaceSlug) {
				return NextResponse.redirect(
					new URL(`/workspace/${workspaceSlug}`, origin),
				);
			}

			// No workspace found - send to onboarding to create one
			return NextResponse.redirect(new URL("/onboarding", origin));
		}

		// Handle /workspace/[slug] routes - allow through for validation in layout
		const segments = pathname.split("/").filter(Boolean);
		if (segments.length >= 2) {
			// Check onboarding status for workspace access
			if (
				appConfig.users.enableOnboarding &&
				!session.user.onboardingComplete
			) {
				return NextResponse.redirect(new URL("/onboarding", origin));
			}

			// Let the layout handle organization-specific validation
			return NextResponse.next();
		}

		return NextResponse.next();
	}

	// Handle /admin routes
	if (pathname.startsWith("/admin")) {
		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		if (!session) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", {
						redirectTo: pathname,
					}),
					origin,
				),
			);
		}

		// Check if user is admin
		if (session.user.role !== "admin") {
			// Redirect non-admin users to their workspace (not /workspace base)
			const workspaceSlug = await getDefaultWorkspaceSlug(req, session);
			if (workspaceSlug) {
				return NextResponse.redirect(
					new URL(`/workspace/${workspaceSlug}`, origin),
				);
			}
			return NextResponse.redirect(new URL("/onboarding", origin));
		}

		return NextResponse.next();
	}

	// Handle /auth routes
	if (pathname.startsWith("/auth")) {
		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		// If user is authenticated and accessing auth pages (except verify), redirect to workspace
		if (session && pathname !== "/auth/verify") {
			// Redirect DIRECTLY to user's workspace (not /workspace base)
			const workspaceSlug = await getDefaultWorkspaceSlug(req, session);
			if (workspaceSlug) {
				return NextResponse.redirect(
					new URL(`/workspace/${workspaceSlug}`, origin),
				);
			}
			return NextResponse.redirect(new URL("/onboarding", origin));
		}

		return NextResponse.next();
	}

	// Handle /onboarding route
	if (pathname.startsWith("/onboarding")) {
		if (!session) {
			return NextResponse.redirect(new URL("/auth/login", origin));
		}

		// If onboarding is complete, redirect DIRECTLY to workspace
		if (session.user.onboardingComplete) {
			const workspaceSlug = await getDefaultWorkspaceSlug(req, session);
			if (workspaceSlug) {
				return NextResponse.redirect(
					new URL(`/workspace/${workspaceSlug}`, origin),
				);
			}
			// If somehow user has completed onboarding but no workspace, stay on onboarding
		}

		return NextResponse.next();
	}

	// Handle /choose-plan route
	if (pathname.startsWith("/choose-plan")) {
		if (!session) {
			return NextResponse.redirect(new URL("/auth/login", origin));
		}

		return NextResponse.next();
	}

	// Paths that don't need locale middleware
	const pathsWithoutLocale = [
		"/organization-invitation",
		"/share", // Public share pages don't need locale or auth
	];

	if (pathsWithoutLocale.some((path) => pathname.startsWith(path))) {
		return NextResponse.next();
	}

	// Handle marketing pages
	if (!appConfig.ui.marketing.enabled) {
		// Redirect to auth/login if marketing is disabled
		return NextResponse.redirect(new URL("/auth/login", origin));
	}

	return intlMiddleware(req);
}

export const config = {
	matcher: [
		"/((?!api|image-proxy|images|fonts|_next/static|_next/image|favicon.ico|icon.png|sitemap.xml|robots.txt).*)",
	],
};
