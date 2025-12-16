import { routing } from "@i18n/routing";
import { config as appConfig } from "@repo/config";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withQuery } from "ufo";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
	const { pathname, origin } = req.nextUrl;

	const sessionCookie = getSessionCookie(req);

	if (pathname.startsWith("/workspace") || pathname.startsWith("/admin")) {
		const response = NextResponse.next();

		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		if (!sessionCookie) {
			return NextResponse.redirect(
				new URL(
					withQuery("/auth/login", {
						redirectTo: pathname,
					}),
					origin,
				),
			);
		}

		return response;
	}

	if (pathname.startsWith("/auth")) {
		if (!appConfig.ui.saas.enabled) {
			return NextResponse.redirect(new URL("/", origin));
		}

		return NextResponse.next();
	}

	const pathsWithoutLocale = [
		"/onboarding",
		"/choose-plan",
		"/organization-invitation",
		"/share", // Public share pages don't need locale or auth
	];

	if (pathsWithoutLocale.some((path) => pathname.startsWith(path))) {
		return NextResponse.next();
	}

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
