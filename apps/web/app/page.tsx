import { auth } from "@repo/auth";
import { redirect } from "next/navigation";

/**
 * Root Page
 *
 * Note: The proxy (middleware) handles most routing logic for authenticated users.
 * This page primarily handles unauthenticated users and serves as a fallback.
 */
export default async function RootPage() {
	const session = await auth.api.getSession({
		headers: await Promise.resolve(new Headers()),
	});

	// If user is authenticated, the proxy will redirect them to workspace
	// This is a fallback in case proxy doesn't catch it
	if (session) {
		const { getOrganizationList } = await import("@saas/auth/lib/server");
		const organizations = await getOrganizationList();
		const firstOrg = organizations[0];

		if (firstOrg) {
			redirect(`/workspace/${firstOrg.slug}`);
		}
		redirect("/onboarding");
	}

	// Unauthenticated users go to login
	redirect("/auth/login");
}
