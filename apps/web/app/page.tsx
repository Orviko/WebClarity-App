import { auth } from "@repo/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
	const session = await auth.api.getSession({
		headers: await Promise.resolve(new Headers()),
	});

	if (session) {
		// Redirect to first workspace or onboarding
		const { getOrganizationList } = await import("@saas/auth/lib/server");
		const organizations = await getOrganizationList();
		const firstOrg = organizations[0];

		if (firstOrg) {
			redirect(`/workspace/${firstOrg.slug}`);
		}
		redirect("/onboarding");
	}

	redirect("/auth/login");
}
